// Script to hide Metropolitan Statistical Areas (MSA) elements in the map
(function() {
  // Function to hide MSA elements
  function hideMSAElements() {
    console.log("[hide-msa] Attempting to hide MSA elements");
    
    // Use exact text matching to hide the Metropolitan Statistical Areas checkbox/label
    const layerLabels = document.querySelectorAll('.leaflet-control-layers-overlays label');
    layerLabels.forEach(label => {
      // Look for exact match "Metropolitan Statistical Areas"
      const spanText = label.querySelector('span')?.textContent?.trim();
      if (spanText === "Metropolitan Statistical Areas") {
        label.style.display = 'none';
        console.log("[hide-msa] Hidden exact MSA layer control item");
      }
    });
    
    // Hide MSA elements in any legend with exact matching
    const legendItems = document.querySelectorAll('.legend-item, .info-legend-item');
    legendItems.forEach(item => {
      const itemText = item.textContent?.trim();
      if (itemText === "Metropolitan Statistical Areas" || 
          item.querySelector('span')?.textContent?.trim() === "Metropolitan Statistical Areas") {
        item.style.display = 'none';
        console.log("[hide-msa] Hidden exact MSA legend item");
      }
    });
    
    // Try to hide only the general MSA layer itself if it exists
    if (window.L && window.map) {
      Object.values(window.map._layers || {}).forEach(layer => {
        if (layer.options && 
            layer.options.name && 
            layer.options.name === "Metropolitan Statistical Areas") {
          try {
            layer.remove();
            console.log("[hide-msa] Removed exact MSA layer");
          } catch (e) {
            console.error("[hide-msa] Error removing layer:", e);
          }
        }
      });
    }
    
    // More aggressive approach - hide any element containing MSA checkbox
    setTimeout(() => {
      document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const label = checkbox.parentElement;
        if (label && label.textContent.includes("Metropolitan Statistical Areas") && 
            !label.textContent.includes("Virgin")) {
          label.style.display = 'none';
          console.log("[hide-msa] Hidden MSA checkbox via parent label");
        }
      });
    }, 500);
  }
  
  // Function to hide the search control
  function hideSearchControl() {
    // Find and hide the search control
    const searchControl = document.querySelector('.leaflet-control-search');
    if (searchControl) {
      searchControl.style.display = 'none';
      console.log("[hide-msa] Hidden search control");
    }
    
    // Also try to remove the search control from the map if it exists
    if (window.L && window.L.map && window.L.Control && window.L.Control.Search) {
      try {
        // If there's an active search control, try to remove it
        const controls = document.querySelectorAll('.leaflet-control-search');
        controls.forEach(control => {
          control.remove();
        });
        console.log("[hide-msa] Removed search control from DOM");
      } catch (e) {
        console.error("[hide-msa] Error removing search control:", e);
      }
    }
  }
  
  // Run immediately and also on DOM content loaded
  hideMSAElements();
  
  document.addEventListener('DOMContentLoaded', function() {
    hideMSAElements();
    
    // Also run after a short delay to catch elements that might be added dynamically
    setTimeout(hideMSAElements, 1000);
    setTimeout(hideMSAElements, 2000);
  });
  
  // Listen for any message asking to hide MSA elements
  window.addEventListener('message', function(event) {
    if (event.data && (
        event.data.type === 'HIDE_MSA_ELEMENTS' || 
        (event.data.type === 'MAP_INIT' && event.data.data && event.data.data.hideMSA) ||
        (event.data.type === 'MAP_CONTROLS_INIT' && event.data.data && event.data.data.hideMSA)
      )) {
      hideMSAElements();
      
      // Re-run after a delay to catch dynamically added elements
      setTimeout(hideMSAElements, 500);
    }
    
    // Also watch for specific request to hide search
    if (event.data && event.data.type === 'MAP_CONTROLS_INIT' && 
        event.data.data && event.data.data.enableSearch === false) {
      hideSearchControl();
      setTimeout(hideSearchControl, 500);
    }
  });
  
  // Create and append a style element to ensure MSA elements are hidden via CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Target the exact Metropolitan Statistical Areas checkbox label */
    .leaflet-control-layers-overlays label:has(span:contains("Metropolitan Statistical Areas")),
    .leaflet-control-layers-overlays input[type="checkbox"] + span:contains("Metropolitan Statistical Areas"),
    /* Extra selectors to ensure it's hidden */
    .leaflet-control-layers-selector[type="checkbox"] + span:contains("Metropolitan Statistical Areas"),
    /* Hide search control */
    .leaflet-control-search {
      display: none !important;
    }
  `;
  document.head.appendChild(styleEl);
})(); 