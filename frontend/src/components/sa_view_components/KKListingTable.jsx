            {filteredData.map((kk, index) => (
              <tr 
                key={`kk-${kk.name}-${index}`} 
                className="kk-clickable-row"
                onClick={() => handleRowClick(kk)}
              >
// ... existing code ... 