import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import MapViewer from './components/MapViewer'
import ControlPanel from './components/ControlPanel'
import DataTable from './components/DataTable'
import RegionDetailView from './components/RegionDetailView'
import StatisticalAreaDetailView from './components/StatisticalAreaDetailView'
import PgServiceView from './components/PgServiceView'
import HHAHServiceView from './components/HHAHServiceView'
import PGView from './components/sa_view_components/PGView'
import HHAHView from './components/sa_view_components/HHAHView'
import PhysicianView from './components/sa_view_components/PhysicianView'
import NPPView from './components/sa_view_components/NPPView'
import OfficeStaffView from './components/sa_view_components/OfficeStaffView'
import PatientView from './components/sa_view_components/PatientView'
import { divisionalGroupToRegions, divisionalGroupToStatisticalAreas } from './utils/regionMapping'
import { getApiUrl } from './config'
import { FunnelDataProvider } from './components/sa_view_components/FunnelDataContext'
import './App.css'
import { PatientProvider } from './context/PatientContext'

// Navigation component that conditionally renders based on route
const Navigation = () => {
  const location = useLocation();
  const isServicePage = location.pathname === '/pg-services' || location.pathname === '/hhah-services';

  if (!isServicePage) return null;

  return (
    <nav className="main-nav">
      <Link to="/" className="nav-link back-link">
        <span className="back-arrow">←</span> Back to Dashboard
      </Link>
    </nav>
  );
};

function App() {
  const [mapStatus, setMapStatus] = useState({
    isLoading: true,
    isGenerated: false,
    generationInProgress: false,
    error: null
  });
  
  const [selectedDivisionalGroup, setSelectedDivisionalGroup] = useState(null);
  const [selectedStatisticalArea, setSelectedStatisticalArea] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sample divisional data for the table
  const divisionalData = [
    { 
      group: 'East', 
      patients: 42650, 
      physicianGroups: 387, 
      agencies: 156, 
      activeOutcomes: 12480 
    },
    { 
      group: 'East Central', 
      patients: 38750, 
      physicianGroups: 295, 
      agencies: 124, 
      activeOutcomes: 10250 
    },
    { 
      group: 'West', 
      patients: 51230, 
      physicianGroups: 412, 
      agencies: 178, 
      activeOutcomes: 18670 
    },
    { 
      group: 'Central', 
      patients: 33120, 
      physicianGroups: 276, 
      agencies: 98, 
      activeOutcomes: 9840 
    }
  ];

  useEffect(() => {
    // Check map status when component mounts
    checkMapStatus();

    // If map generation is in progress, check status every 3 seconds
    let interval = null;
    if (mapStatus.generationInProgress) {
      interval = setInterval(checkMapStatus, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mapStatus.generationInProgress]);

  const checkMapStatus = async () => {
    try {
      const response = await fetch(getApiUrl('/api/map-status'));
      if (!response.ok) {
        throw new Error('Failed to check map status');
      }
      const data = await response.json();
      setMapStatus({
        isLoading: false,
        isGenerated: data.exists,
        generationInProgress: data.generationInProgress,
        error: null
      });
    } catch (err) {
      setMapStatus({
        isLoading: false,
        isGenerated: false,
        generationInProgress: false,
        error: err.message
      });
    }
  };

  const generateMap = async () => {
    try {
      setMapStatus(prev => ({ ...prev, generationInProgress: true }));
      const response = await fetch(getApiUrl('/api/generate-map'));
      if (!response.ok) {
        throw new Error('Failed to generate map');
      }
      const data = await response.json();
      
      if (data.success) {
        // Start polling for map status
        const pollInterval = setInterval(async () => {
          const statusResponse = await fetch(getApiUrl('/api/map-status'));
          const statusData = await statusResponse.json();
          
          if (statusData.exists) {
            clearInterval(pollInterval);
            setMapStatus({
              isLoading: false,
              isGenerated: true,
              generationInProgress: false,
              error: null
            });
          }
        }, 5000); // Poll every 5 seconds
      }
    } catch (err) {
      setMapStatus(prev => ({
        ...prev,
        generationInProgress: false,
        error: err.message
      }));
    }
  };

  const handleRowClick = (group) => {
    setIsTransitioning(true);
    // Add slight delay to show loading animation
    setTimeout(() => {
      setSelectedDivisionalGroup(group);
      setSelectedStatisticalArea(null);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToOverview = () => {
    setIsTransitioning(true);
    // Add slight delay to show loading animation
    setTimeout(() => {
      setSelectedDivisionalGroup(null);
      setSelectedStatisticalArea(null);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSelectStatisticalArea = (area) => {
    console.log(`Selected statistical area: ${area}`);
    setIsTransitioning(true);
    // Add slight delay to show loading animation
    setTimeout(() => {
      setSelectedStatisticalArea(area);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToRegionView = () => {
    setIsTransitioning(true);
    // Add slight delay to show loading animation
    setTimeout(() => {
      setSelectedStatisticalArea(null);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <PatientProvider>
        <FunnelDataProvider>
          <div className="dashboard-container">
            <Navigation />
            
            <div className="dashboard-content">
              <Routes>
                <Route path="/" element={
                  <>
                    {mapStatus.isLoading ? (
                      <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>Loading dashboard data...</p>
                      </div>
                    ) : mapStatus.generationInProgress ? (
                      <div className="map-processing">
                        <div className="content-card">
                          <h2>Generating Map</h2>
                          <div className="progress-container">
                            <div className="progress-bar"></div>
                          </div>
                          <p>The map is being prepared in the background.</p>
                        </div>
                      </div>
                    ) : isTransitioning ? (
                      <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>Loading view...</p>
                      </div>
                    ) : selectedDivisionalGroup && selectedStatisticalArea ? (
                      <div className="dashboard-detail-view">
                        <StatisticalAreaDetailView 
                          statisticalArea={selectedStatisticalArea}
                          divisionalGroup={selectedDivisionalGroup}
                          onBack={handleBackToRegionView}
                        />
                      </div>
                    ) : selectedDivisionalGroup ? (
                      <div className="dashboard-detail-view">
                        <RegionDetailView 
                          divisionalGroup={selectedDivisionalGroup}
                          regions={divisionalGroupToRegions[selectedDivisionalGroup] || []}
                          statisticalAreas={divisionalGroupToStatisticalAreas[selectedDivisionalGroup] || []}
                          onBack={handleBackToOverview}
                          onSelectStatisticalArea={handleSelectStatisticalArea}
                        />
                      </div>
                    ) : (
                      <div className="dashboard-grid">
                        <div className="dashboard-card map-card">
                          <div className="card-header">
                            <h2>Regional Distribution Map</h2>
                          </div>
                          <div className="card-content">
                            {mapStatus.isGenerated ? (
                              <div className="map-container-wrapper">
                                <MapViewer />
                                <ControlPanel />
                              </div>
                            ) : (
                              <div className="map-not-generated-inner">
                                <h3>Map Visualization</h3>
                                <p>Click the button below to generate the map.</p>
                                <button onClick={generateMap} className="primary-button">
                                  Generate Map
                                </button>
                                {mapStatus.error && <p className="error-message">{mapStatus.error}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="dashboard-card data-card">
                          <div className="card-header">
                            <h2>Divisional Group Leaderboard</h2>
                          </div>
                          <div className="card-content">
                            <DataTable 
                              data={divisionalData} 
                              onRowClick={handleRowClick}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                } />
                <Route path="/pg-services" element={<PgServiceView />} />
                <Route path="/hhah-services" element={<HHAHServiceView />} />
                <Route path="/pg-view/:pgName" element={<PGView />} />
                <Route path="/hhah-view/:hhahName" element={<HHAHView />} />
                <Route path="/physician/:id" element={<PhysicianView />} />
                <Route path="/npp/:nppId" element={<NPPView />} />
                <Route path="/office-staff/:staffId" element={<OfficeStaffView />} />
                <Route path="/patient-view/:id" element={<PatientView />} />
              </Routes>
            </div>
            
            <footer className="dashboard-footer">
              <p>Data source: US Census TIGER/Line Shapefiles 2023</p>
            </footer>
          </div>
        </FunnelDataProvider>
      </PatientProvider>
    </BrowserRouter>
  )
}

export default App
