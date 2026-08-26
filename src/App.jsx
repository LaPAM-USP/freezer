import React, { useState, useEffect, useCallback } from 'react';
import BioCanvas from './components/BioCanvas';
import Navbar from './components/Navbar';
import FreezerHero from './components/FreezerHero';
import FreezerVisual from './components/FreezerVisual';
import SingleDrawerFocus from './components/SingleDrawerFocus';
import TableView from './components/TableView';
import StatsSummary from './components/StatsSummary';
import BoxDetailModal from './components/BoxDetailModal';
import BoxFormModal from './components/BoxFormModal';
import DrawerEditModal from './components/DrawerEditModal';
import PrintLabelModal from './components/PrintLabelModal';
import QrScannerModal from './components/QrScannerModal';
import MembersManageModal from './components/MembersManageModal';
import LockScreen from './components/LockScreen';
import Footer from './components/Footer';

import { 
  loadFreezerData, 
  saveFreezerData, 
  loadMembersData,
  saveMembersData,
  resetToInitialData, 
  exportDataToJson, 
  exportDataToCsv 
} from './utils/storage';
import { parseSpotId } from './utils/coordinates';
import { 
  isSupabaseConfigured, 
  fetchRemoteFreezerData, 
  fetchRemoteMembers,
  saveRemoteMembersList,
  saveRemoteBox, 
  deleteRemoteBox, 
  saveRemoteDrawer, 
  batchSeedRemoteData,
  subscribeToRealtimeChanges 
} from './services/supabase';

const AUTH_STORAGE_KEY = 'lapam_freezer_auth_v1';

export default function App() {
  const [lang, setLang] = useState('pt'); // 'pt' or 'en'
  const [activeView, setActiveView] = useState('freezer'); // 'freezer', 'drawers', 'table', 'stats'
  const [focusedDrawerId, setFocusedDrawerId] = useState(1);

  // Access Control / Master Password Lock State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return (
        localStorage.getItem(AUTH_STORAGE_KEY) === 'true' ||
        sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
      );
    } catch (e) {
      return false;
    }
  });

  const handleUnlock = (remember) => {
    setIsAuthenticated(true);
    try {
      if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      }
    } catch (e) {}
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
  };

  // Core Data State
  const [freezerData, setFreezerData] = useState(() => loadFreezerData());
  const { drawers, boxes } = freezerData;

  // Lab Members State (customizable dynamically)
  const [members, setMembers] = useState(() => loadMembersData());
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Cloud connection state
  const [isCloudConnected, setIsCloudConnected] = useState(() => isSupabaseConfigured());
  const [isSyncing, setIsSyncing] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrawer, setSelectedDrawer] = useState('all');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBiosafety, setSelectedBiosafety] = useState('all');

  // Modals state
  const [selectedBoxForDetail, setSelectedBoxForDetail] = useState(null);
  const [formModalState, setFormModalState] = useState({
    isOpen: false,
    initialSpot: null,
    existingBox: null,
  });
  const [drawerToEdit, setDrawerToEdit] = useState(null);
  const [printModalState, setPrintModalState] = useState({
    isOpen: false,
    initialBox: null,
    initialDrawerNum: null,
  });
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Update local memory and localStorage
  const updateDataLocally = (newDrawers, newBoxes) => {
    const updated = { drawers: newDrawers, boxes: newBoxes };
    setFreezerData(updated);
    saveFreezerData(updated);
  };

  // Sync from Supabase
  const syncFromCloud = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsCloudConnected(false);
      return;
    }

    try {
      setIsSyncing(true);
      const [remote, remoteMembers] = await Promise.all([
        fetchRemoteFreezerData(),
        fetchRemoteMembers()
      ]);

      if (remoteMembers && remoteMembers.length > 0) {
        setMembers(remoteMembers);
        saveMembersData(remoteMembers);
      }

      if (remote) {
        setIsCloudConnected(true);
        // If remote database is completely empty, seed it with current local data
        if (remote.drawers.length === 0 && remote.boxes.length === 0) {
          const local = loadFreezerData();
          if (local.drawers.length > 0 || local.boxes.length > 0) {
            await batchSeedRemoteData(local.drawers, local.boxes);
          }
        } else {
          setFreezerData(prev => {
            const updatedDrawers = remote.drawers.length > 0 ? remote.drawers : prev.drawers;
            const updatedBoxes = remote.boxes;
            const updated = { drawers: updatedDrawers, boxes: updatedBoxes };
            saveFreezerData(updated);
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn('Failed to sync from cloud, operating in local mode:', err);
      setIsCloudConnected(false);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial cloud fetch and Realtime subscription
  useEffect(() => {
    syncFromCloud();

    // Subscribe to realtime database changes from other users
    const unsubscribe = subscribeToRealtimeChanges(() => {
      console.log('[Supabase] Database change detected, refreshing...');
      syncFromCloud();
    });

    return () => {
      unsubscribe();
    };
  }, [syncFromCloud]);

  // URL Deep Link check (e.g. ?spot=D1-R2-C3)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const spotParam = params.get('spot');
    if (spotParam) {
      const parsed = parseSpotId(spotParam);
      if (parsed) {
        const found = boxes.find(b => b.spotId.toUpperCase() === spotParam.toUpperCase());
        if (found) {
          setSelectedBoxForDetail(found);
        } else {
          // Open registration for this spot
          setFormModalState({
            isOpen: true,
            initialSpot: parsed,
            existingBox: null,
          });
        }
      }
    }
  }, [boxes]);

  // CRUD Handlers with Cloud Upsert + Local Fallback
  const handleSaveBox = async (boxData) => {
    let updatedBoxes = [];
    const exists = boxes.some(b => b.id === boxData.id);

    if (exists) {
      updatedBoxes = boxes.map(b => b.id === boxData.id ? boxData : b);
    } else {
      updatedBoxes = [boxData, ...boxes];
    }

    updateDataLocally(drawers, updatedBoxes);

    // Sync to Supabase if connected
    if (isSupabaseConfigured()) {
      try {
        await saveRemoteBox(boxData);
      } catch (err) {
        console.error('Failed to sync box to cloud:', err);
      }
    }
  };

  const handleDeleteBox = async (boxId) => {
    const updatedBoxes = boxes.filter(b => b.id !== boxId);
    updateDataLocally(drawers, updatedBoxes);

    // Sync to Supabase if connected
    if (isSupabaseConfigured()) {
      try {
        await deleteRemoteBox(boxId);
      } catch (err) {
        console.error('Failed to delete box in cloud:', err);
      }
    }
  };

  const handleSaveDrawer = async (updatedDrawer) => {
    const updatedDrawers = drawers.map(d => d.id === updatedDrawer.id ? updatedDrawer : d);
    updateDataLocally(updatedDrawers, boxes);

    // Sync to Supabase if connected
    if (isSupabaseConfigured()) {
      try {
        await saveRemoteDrawer(updatedDrawer);
      } catch (err) {
        console.error('Failed to sync drawer to cloud:', err);
      }
    }
  };

  const handleSaveMember = async (memberData) => {
    const exists = members.some(m => m.id === memberData.id);
    const updatedMembers = exists 
      ? members.map(m => m.id === memberData.id ? memberData : m)
      : [...members, memberData];

    setMembers(updatedMembers);
    saveMembersData(updatedMembers);

    if (isSupabaseConfigured()) {
      try {
        await saveRemoteMembersList(updatedMembers);
      } catch (err) {
        console.error('Failed to save members to cloud:', err);
      }
    }
  };

  const handleDeleteMember = async (memberId) => {
    const updatedMembers = members.filter(m => m.id !== memberId);
    setMembers(updatedMembers);
    saveMembersData(updatedMembers);

    if (isSupabaseConfigured()) {
      try {
        await saveRemoteMembersList(updatedMembers);
      } catch (err) {
        console.error('Failed to delete member in cloud:', err);
      }
    }
  };

  const handleReassignBoxes = async (oldOwnerId, newOwnerId, newOwnerName) => {
    const updatedBoxes = boxes.map(b => {
      if (b.ownerId === oldOwnerId) {
        const updated = { ...b, ownerId: newOwnerId, ownerName: newOwnerName };
        if (isSupabaseConfigured()) {
          saveRemoteBox(updated).catch(err => console.error(err));
        }
        return updated;
      }
      return b;
    });
    updateDataLocally(drawers, updatedBoxes);
  };

  const handleResetData = () => {
    const reset = resetToInitialData();
    setFreezerData(reset);
  };

  const handleImportJson = async (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.drawers) && Array.isArray(parsed.boxes)) {
        updateDataLocally(parsed.drawers, parsed.boxes);

        // If cloud connected, batch upload imported backup to cloud
        if (isSupabaseConfigured()) {
          await batchSeedRemoteData(parsed.drawers, parsed.boxes);
        }

        alert(lang === 'pt' ? 'Dados importados e sincronizados com sucesso!' : 'Data imported and synced successfully!');
      } else {
        alert(lang === 'pt' ? 'Formato de JSON inválido.' : 'Invalid JSON format.');
      }
    } catch (e) {
      alert(lang === 'pt' ? 'Erro ao ler arquivo JSON.' : 'Error parsing JSON file.');
    }
  };

  // Find Next Empty Spot helper
  const handleFindNextEmptySpot = () => {
    for (let d = 1; d <= 4; d++) {
      for (let r = 1; r <= 4; r++) {
        for (let c = 1; c <= 5; c++) {
          const occupied = boxes.some(b => b.drawer === d && b.row === r && b.col === c);
          if (!occupied) {
            setFormModalState({
              isOpen: true,
              initialSpot: { drawer: d, row: r, col: c },
              existingBox: null,
            });
            return;
          }
        }
      }
    }
    alert(lang === 'pt' ? 'O Freezer está completamente cheio (80/80 vagas ocupadas)!' : 'Freezer is completely full (80/80 spots occupied)!');
  };

  // If not authenticated, show LockScreen
  if (!isAuthenticated) {
    return (
      <LockScreen
        lang={lang}
        setLang={setLang}
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900 overflow-x-hidden">
      
      {/* Subtle BioCanvas ambient animation (hidden during print) */}
      <div className="no-print">
        <BioCanvas />
      </div>

      {/* Main App Content Container (hidden during print) */}
      <div className="relative z-10 flex flex-col min-h-screen no-print">
        
        {/* Navigation Bar */}
        <Navbar
          lang={lang}
          setLang={setLang}
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenRegister={(spot) => setFormModalState({ isOpen: true, initialSpot: spot, existingBox: null })}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenMembers={() => setIsMembersModalOpen(true)}
          onExportJson={() => exportDataToJson(drawers, boxes)}
          onExportCsv={() => exportDataToCsv(boxes, drawers)}
          onImportJson={handleImportJson}
          onResetData={handleResetData}
          occupiedCount={boxes.length}
          totalCapacity={80}
          isCloudConnected={isCloudConnected}
          isSyncing={isSyncing}
          onSyncCloud={syncFromCloud}
          onLock={handleLock}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          
          {/* Hero & Search Header */}
          <FreezerHero
            lang={lang}
            boxes={boxes}
            drawers={drawers}
            members={members}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDrawer={selectedDrawer}
            setSelectedDrawer={setSelectedDrawer}
            selectedOwner={selectedOwner}
            setSelectedOwner={setSelectedOwner}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBiosafety={selectedBiosafety}
            setSelectedBiosafety={setSelectedBiosafety}
            onFindNextEmptySpot={handleFindNextEmptySpot}
          />

          {/* Dynamic View Mode Content */}
          {activeView === 'freezer' && (
            <FreezerVisual
              lang={lang}
              drawers={drawers}
              boxes={boxes}
              members={members}
              searchQuery={searchQuery}
              selectedDrawer={selectedDrawer}
              selectedOwner={selectedOwner}
              selectedCategory={selectedCategory}
              selectedBiosafety={selectedBiosafety}
              onSelectSpot={(d, r, c) => setFormModalState({ isOpen: true, initialSpot: { drawer: d, row: r, col: c }, existingBox: null })}
              onSelectBox={(box) => setSelectedBoxForDetail(box)}
              onEditDrawer={(drawer) => setDrawerToEdit(drawer)}
              onPrintDrawerLabels={(drawerNum) => setPrintModalState({ isOpen: true, initialBox: null, initialDrawerNum: drawerNum })}
              onFocusDrawer={(drawerNum) => {
                setFocusedDrawerId(drawerNum);
                setActiveView('drawers');
              }}
            />
          )}

          {activeView === 'drawers' && (
            <SingleDrawerFocus
              lang={lang}
              drawers={drawers}
              boxes={boxes}
              focusedDrawerId={focusedDrawerId}
              setFocusedDrawerId={setFocusedDrawerId}
              onSelectSpot={(d, r, c) => setFormModalState({ isOpen: true, initialSpot: { drawer: d, row: r, col: c }, existingBox: null })}
              onSelectBox={(box) => setSelectedBoxForDetail(box)}
              onEditDrawer={(drawer) => setDrawerToEdit(drawer)}
              onPrintDrawerLabels={(drawerNum) => setPrintModalState({ isOpen: true, initialBox: null, initialDrawerNum: drawerNum })}
              onBackToFreezer={() => setActiveView('freezer')}
            />
          )}

          {activeView === 'table' && (
            <TableView
              lang={lang}
              boxes={boxes}
              drawers={drawers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectBox={(box) => setSelectedBoxForDetail(box)}
              onEditBox={(box) => setFormModalState({ isOpen: true, initialSpot: null, existingBox: box })}
              onDeleteBox={handleDeleteBox}
              onPrintLabel={(box) => setPrintModalState({ isOpen: true, initialBox: box, initialDrawerNum: null })}
              onOpenRegister={(spot) => setFormModalState({ isOpen: true, initialSpot: spot, existingBox: null })}
              onExportCsv={() => exportDataToCsv(boxes, drawers)}
            />
          )}

          {activeView === 'stats' && (
            <StatsSummary
              lang={lang}
              boxes={boxes}
              drawers={drawers}
              members={members}
            />
          )}

        </main>

        {/* Footer */}
        <Footer lang={lang} />

      </div>

      {/* MODALS */}

      {/* 1. Box Detail Modal */}
      {selectedBoxForDetail && (
        <BoxDetailModal
          lang={lang}
          box={selectedBoxForDetail}
          onClose={() => setSelectedBoxForDetail(null)}
          onEdit={(box) => {
            setSelectedBoxForDetail(null);
            setFormModalState({ isOpen: true, initialSpot: null, existingBox: box });
          }}
          onDelete={handleDeleteBox}
          onPrintLabel={(box) => setPrintModalState({ isOpen: true, initialBox: box, initialDrawerNum: null })}
        />
      )}

      {/* 2. Box Form Modal (Create / Edit) */}
      {formModalState.isOpen && (
        <BoxFormModal
          lang={lang}
          initialSpot={formModalState.initialSpot}
          existingBox={formModalState.existingBox}
          boxes={boxes}
          drawers={drawers}
          members={members}
          onOpenMembers={() => setIsMembersModalOpen(true)}
          onClose={() => setFormModalState({ isOpen: false, initialSpot: null, existingBox: null })}
          onSaveBox={handleSaveBox}
        />
      )}

      {/* 3. Drawer Edit Modal */}
      {drawerToEdit && (
        <DrawerEditModal
          lang={lang}
          drawer={drawerToEdit}
          members={members}
          onClose={() => setDrawerToEdit(null)}
          onSaveDrawer={handleSaveDrawer}
        />
      )}

      {/* 4. Print Label Modal */}
      {printModalState.isOpen && (
        <PrintLabelModal
          lang={lang}
          initialBox={printModalState.initialBox}
          initialDrawerNum={printModalState.initialDrawerNum}
          boxes={boxes}
          drawers={drawers}
          onClose={() => setPrintModalState({ isOpen: false, initialBox: null, initialDrawerNum: null })}
        />
      )}

      {/* 5. QR Scanner / Coordinate Search Modal */}
      {isScannerOpen && (
        <QrScannerModal
          lang={lang}
          boxes={boxes}
          onClose={() => setIsScannerOpen(false)}
          onFoundBox={(box) => setSelectedBoxForDetail(box)}
          onRegisterEmptySpot={(d, r, c) => setFormModalState({ isOpen: true, initialSpot: { drawer: d, row: r, col: c }, existingBox: null })}
        />
      )}

      {/* 6. Members & Researchers Manager Modal */}
      {isMembersModalOpen && (
        <MembersManageModal
          lang={lang}
          members={members}
          boxes={boxes}
          onClose={() => setIsMembersModalOpen(false)}
          onSaveMember={handleSaveMember}
          onDeleteMember={handleDeleteMember}
          onReassignBoxes={handleReassignBoxes}
        />
      )}

    </div>
  );
}
