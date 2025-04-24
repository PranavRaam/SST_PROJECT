// Script to hide Metropolitan Statistical Areas (MSA) elements in the map
(function() {
  // Function to hide MSA elements
  function hideMSAElements() {
    console.log("[hide-msa] Attempting to hide MSA elements");
    
    // Hide MSA elements in the layer control
    const layerLabels = document.querySelectorAll('.leaflet-control-layers-overlays label');
    layerLabels.forEach(label => {
      const text = label.textContent || '';
      if (text.includes('Metropolitan') || text.includes('MSA') || text.includes('Statistical Area')) {
        label.style.display = 'none';
        console.log("[hide-msa] Hidden layer control item:", text);
      }
    });
    
    // Hide MSA elements in any legend
    const legendItems = document.querySelectorAll('.legend-item, .info-legend-item');
    legendItems.forEach(item => {
      const text = item.textContent || '';
      if (text.includes('Metropolitan') || text.includes('MSA') || text.includes('Statistical Area')) {
        item.style.display = 'none';
        console.log("[hide-msa] Hidden legend item:", text);
      }
    });
    
    // Try to hide the MSA layer itself if it exists
    if (window.L && window.L.map && window.L.map._layers) {
      Object.values(window.L.map._layers).forEach(layer => {
        if (layer.options && (
            (layer.options.name && (
              layer.options.name.includes('Metropolitan') || 
              layer.options.name.includes('MSA') || 
              layer.options.name.includes('Statistical Area')
            )) || 
            (layer._tooltipContent && (
              layer._tooltipContent.includes('Metropolitan') || 
              layer._tooltipContent.includes('MSA') || 
              layer._tooltipContent.includes('Statistical Area')
            ))
          )) {
          layer.remove();
          console.log("[hide-msa] Removed MSA layer:", layer.options.name);
        }
      });
    }
    
    // Specifically target the MSA heading element if it exists
    const heading = document.querySelector('div.metropolitan-heading');
    if (heading) {
      heading.style.display = 'none';
      console.log("[hide-msa] Hidden MSA heading");
    }
    
    // Hide the search control
    hideSearchControl();
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
    /* Hide Metropolitan Statistical Areas elements */
    .leaflet-control-layers-overlays label:has(span:contains("Metropolitan")),
    .leaflet-control-layers-overlays label:has(span:contains("MSA")),
    .leaflet-control-layers-overlays label:has(span:contains("Statistical Area")),
    .legend-item:has(span:contains("Metropolitan")),
    .legend-item:has(span:contains("MSA")),
    .legend-item:has(span:contains("Statistical Area")),
    div.metropolitan-heading,
    .leaflet-control-layers-overlays > label > span > span,
    /* Hide search control */
    .leaflet-control-search {
      display: none !important;
    }
  `;
  document.head.appendChild(styleEl);
})(); 