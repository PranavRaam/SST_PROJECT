/**
 * Mapping of the regions to the 4 divisional groups
 */

export const regionToDivisionalGroup = {
  West: "West",
  Central: "Central",
  "East Central": "East Central",
  East: "East",
};

// Map each divisional group to its regions
export const divisionalGroupToRegions = {
  West: ["West"],
  Central: ["Central"],
  "East Central": ["East Central"],
  East: ["East"],
};

// Map each divisional group to its subdivisions from the map
export const divisionalGroupToSubdivisions = {
  West: [
    "Pacific Northwest Division",
    "Intermountain Division",
    "Southwest Division",
    "LA CA Division",
    "Bay Area Central CA Division"
  ],
  Central: [
    "Great Plains Division",
    "Illinois Wisconsin Division",
    "Central Division 3",
    "The South Division",
    "Central & East Texas Division"
  ],
  "East Central": [
    "East Central Divisional GRP Division 1",
    "East Central Divisional GRP Division 2",
    "East Central Divisional GRP Division 3",
    "East Central Divisional GRP Division 4",
    "East Central Divisional GRP Division 5"
  ],
  East: [
    "NEMA Divisional GRP Division 1",
    "NEMA Divisional GRP Division 2",
    "NEMA Divisional GRP Division 3",
    "NEMA Divisional GRP Division 4",
    "NEMA Divisional GRP Division 5"
  ]
};

// Subdivision colors based on the map
export const subdivisionColors = {
  "Pacific Northwest Division": "#FF5B76",
  "Intermountain Division": "#FF9A8B",
  "Southwest Division": "#FF6C5C",
  "LA CA Division": "#CC0000",
  "Bay Area Central CA Division": "#FFBDB4",
  "Great Plains Division": "#FFF7AA",
  "Illinois Wisconsin Division": "#FFBB8B",
  "Central Division 3": "#FFFF00",
  "The South Division": "#bfab97",
  "Central & East Texas Division": "#F0F0DC",
  "East Central Divisional GRP Division 1": "#73FADE",
  "East Central Divisional GRP Division 2": "#50CCA7",
  "East Central Divisional GRP Division 3": "#157F67",
  "East Central Divisional GRP Division 4": "#0b4e3e",
  "East Central Divisional GRP Division 5": "#a0e6a0",
  "NEMA Divisional GRP Division 1": "#702080",
  "NEMA Divisional GRP Division 2": "#8e44ad",
  "NEMA Divisional GRP Division 3": "#9966CC",
  "NEMA Divisional GRP Division 4": "#6a0dad",
  "NEMA Divisional GRP Division 5": "#d8bfd8"
};

// Map subdivisions to their MSAs based on geographical location
export const subdivisionToMSAs = {
  "Pacific Northwest Division": [
    "Bellingham",
    "Bremerton-Silverdale",
    "Kahului-Wailuku-Lahaina",
    "Kennewick-Richland",
    "Mount Vernon-Anacortes",
    "Olympia-Tumwater",
    "Redding",
    "Santa Rosa",
    "Seattle-Tacoma-Bellevue",
    "Spokane-Spokane Valley",
    "Urban Honolulu",
    "Bend-Redmond",
    "Walla Walla",
    "Wenatchee",
    "Yakima",
    "Yuba City",
    "Corvallis",
    "Grants Pass",
    "Medford",
    "Portland-Vancouver-Hillsboro",
    "Salem"
  ]
  ,
  "Intermountain Division": [
    "Billings",
    "Boise City",
    "Boulder",
    "Broomfield",
    "Carson City",
    "Casper",
    "Cheyenne",
    "Coeur d'Alene",
    "Colorado Springs",
    "Denver-Aurora-Lakewood",
    "Fort Collins",
    "Fort Morgan Micropolitan Statistical Area",
    "Grand Junction",
    "Great Falls",
    "Greeley",
    "Hot Springs",
    "Idaho Falls",
    "Las Vegas-Henderson-Paradise",
    "Lewiston",
    "Logan",
    "Missoula",
    "Ogden-Clearfield",
    "Pine Bluff",
    "Pocatello",
    "Provo-Orem",
    "Pueblo",
    "Reno",
    "Salt Lake City",
    "St. George",
    "Twin Falls"
  ]
  ,
  "Southwest Division": [
    "Abilene",
    "Albuquerque",
    "Amarillo",
    "Anchorage",
    "Brownsville-Harlingen",
    "Carlsbad Micropolitan Statistical Area",
    "Clovis Micropolitan Statistical Area",
    "Corpus Christi",
    "Dallas–Fort Worth–Arlington",
    "El Paso",
    "Farmington",
    "Flagstaff",
    "Lake Havasu City-Kingman",
    "Laredo",
    "Las Cruces",
    "Levelland Micropolitan Statistical Area",
    "Longview",
    "Lubbock",
    "McAllen-Edinburg-Mission",
    "Midland",
    "Odessa",
    "Pampa Micropolitan Statistical Area",
    "Phoenix-Mesa-Scottsdale",
    "Prescott",
    "San Angelo",
    "Santa Barbara",
    "Santa Fe",
    "Sierra Vista-Douglas",
    "Tucson",
    "Yuma"
  ]
  ,
  "LA CA Division": [
    "Bakersfield",
    "Los Angeles-Long Beach-Anaheim",
    "Riverside-San Bernardino-Ontario",
    "San Diego-Carlsbad",
    "San Luis Obispo-Paso Robles-Arroyo Grande"
  ]
  ,
  "Bay Area Central CA Division": [
    "Chico",
    "El Centro",
    "Fairbanks",
    "Fresno",
    "Hanford-Corcoran",
    "Madera",
    "Merced",
    "Modesto",
    "Napa",
    "Oxnard-Thousand Oaks-Ventura",
    "Sacramento-Roseville-Arden-Arcade",
    "Salinas",
    "San Francisco-Oakland-Hayward",
    "San Jose-Sunnyvale-Santa Clara",
    "Santa Cruz-Watsonville",
    "Santa Maria-Santa Barbara",
    "Stockton-Lodi",
    "Vallejo-Fairfield",
    "Visalia-Porterville"
  ]
  ,
  
  "Great Plains Division": [
    "Ames",
    "Appleton",
    "Cedar Rapids",
    "Davenport-Moline-Rock Island",
    "Des Moines-West Des Moines",
    "Dubuque",
    "Duluth",
    "Fargo",
    "Grand Forks",
    "Grand Island",
    "Iowa City",
    "Lawrence",
    "Lincoln",
    "Manhattan",
    "Mankato-North Mankato",
    "Omaha-Council Bluffs",
    "Rapid City",
    "Rochester",
    "Sioux City",
    "Sioux Falls",
    "St. Cloud",
    "Topeka",
    "Waterloo-Cedar Falls",
    "Youngstown-Warren-Boardman"
  ]
  ,
  "Illinois Wisconsin Division": [
    "Bloomington",
    "Carbondale-Marion",
    "Champaign-Urbana",
    "Chicago-Naperville-Elgin",
    "Cleveland-Elyria",
    "Danville",
    "Eau Claire",
    "Fond du Lac",
    "Green Bay",
    "Janesville-Beloit",
    "Kankakee",
    "La Crosse-Onalaska",
    "Madison",
    "Milwaukee-Waukesha-West Allis",
    "Minneapolis-St. Paul-Bloomington",
    "Oshkosh-Neenah",
    "Peoria",
    "Racine",
    "Rockford",
    "Sheboygan",
    "Springfield",
    "Wausau"
  ],
  "Central Division 3": [
    "Ardmore Micropolitan Statistical Area",
    "Cape Girardeau",
    "Columbia",
    "Durant Micropolitan Statistical Area",
    "Enid",
    "Eugene",
    "Jefferson City",
    "Joplin",
    "Kansas City",
    "Lawton",
    "Memphis",
    "Oklahoma City",
    "St. Joseph",
    "St. Louis",
    "Tulsa"
  ]
  ,
  "The South Division": [
    "Alexandria",
    "Anniston-Oxford-Jacksonville",
    "Auburn-Opelika",
    "Baton Rouge",
    "Birmingham-Hoover",
    "Bismarck",
    "Columbus",
    "Daphne-Fairhope-Foley",
    "Dothan",
    "Fayetteville-Springdale-Rogers",
    "Florence-Muscle Shoals",
    "Fort Smith",
    "Gadsden",
    "Gulfport-Biloxi-Pascagoula",
    "Hammond",
    "Hattiesburg",
    "Houma-Thibodaux",
    "Huntsville Micropolitan Statistical Area",
    "Huntsville",
    "Jackson",
    "Lafayette-Opelousas-Morgan City Combined Statistical Area",
    "Lafayette",
    "Lake Charles",
    "Mobile",
    "Monroe",
    "Montgomery",
    "Natchez Micropolitan Statistical Area",
    "New Orleans-Metairie",
    "Paris Micropolitan Statistical Area",
    "Shreveport-Bossier City",
    "Texarkana",
    "Tuscaloosa"
  ]
  ,
  "Central & East Texas Division": [
    "Alice Micropolitan Statistical Area",
    "Austin-Round Rock",
    "Beaumont-Port Arthur",
    "Benavides Micropolitan Statistical Area",
    "Brownsville–Harlingen",
    "Brownwood Micropolitan Statistical Area",
    "Bryan-College Station",
    "Cleveland",
    "Corpus Christi",
    "Dallas-Fort Worth-Arlington",
    "Decatur",
    "Del Rio Micropolitan Statistical Area",
    "Eagle Pass Micropolitan Statistical Area",
    "El Paso",
    "Fort Worth-Arlington",
    "Houston-The Woodlands-Sugar Land",
    "Kerrville Micropolitan Statistical Area",
    "Killeen-Temple",
    "Laredo",
    "Laredo Micropolitan Statistical Area",
    "Livingston Micropolitan Statistical Area",
    "Longview",
    "Lubbock",
    "McAllen-Edinburg-Mission",
    "Medford",
    "Nacogdoches Micropolitan Statistical Area",
    "Odessa",
    "Palestine Micropolitan Statistical Area",
    "San Antonio-New Braunfels",
    "San Marcos",
    "Sherman-Denison",
    "Sweetwater Micropolitan Statistical Area",
    "Texarkana",
    "Tyler",
    "Victoria",
    "Waco",
    "Wichita Falls"
  ]
  ,

  "East Central Divisional GRP Division 1": [
    "Akron",
    "Albany-Schenectady-Troy",
    "Albany",
    "Beckley",
    "Binghamton",
    "Buffalo-Cheektowaga-Niagara Falls",
    "Canton-Massillon",
    "Charleston",
    "Cleveland",
    "Elmira",
    "Erie",
    "Glens Falls",
    "Ithaca",
    "Mansfield",
    "Morgantown",
    "New York-Newark-Jersey City",
    "Parkersburg-Vienna",
    "Philadelphia-Camden-Wilmington",
    "Pittsburgh",
    "Rochester",
    "Syracuse",
    "Utica-Rome",
    "Watertown-Fort Drum",
    "Weirton-Steubenville",
    "Wheeling"
  ]
  ,
  "East Central Divisional GRP Division 2": [
    "Anderson",
    "Ann Arbor",
    "Battle Creek",
    "Bay City",
    "Bloomington",
    "Chicago-Naperville-Elgin",
    "Detroit-Warren-Dearborn",
    "Elkhart-Goshen",
    "Evansville",
    "Flint",
    "Fort Wayne",
    "Grand Rapids-Wyoming",
    "Indianapolis-Carmel-Anderson",
    "Kalamazoo-Portage",
    "Kokomo",
    "Lafayette",
    "Lansing-East Lansing",
    "Michigan City-La Porte",
    "Midland",
    "Muncie",
    "Muskegon",
    "Niles-Benton Harbor",
    "Saginaw",
    "South Bend-Mishawaka",
    "Terre Haute"
  ]
  ,
  "East Central Divisional GRP Division 3": [
    "Sarasota-Bradenton-Venice",
    "Sebastian-Vero Beach",
    "Bowling Green",
    "Chattanooga",
    "Cincinnati",
    "Clarksville",
    "Columbus",
    "Cookeville Micropolitan Statistical Area",
    "Danville",
    "Dayton",
    "Elizabethtown-Fort Knox",
    "Hohenwald",
    "Huntington-Ashland",
    "Jackson",
    "Johnson City",
    "Kingsport-Bristol-Bristol",
    "Knoxville",
    "Lawrenceburg",
    "Lexington-Fayette",
    "Lima",
    "Louisville/Jefferson County",
    "Memphis",
    "Morristown",
    "Nashville-Davidson-Murfreesboro-Franklin",
    "Owensboro",
    "Richmond",
    "Shelbyville Micropolitan Statistical Area",
    "Springfield",
    "Toledo",
    "Tullahoma–Manchester"
  ]
  ,
  "East Central Divisional GRP Division 4": [
    "Athens-Clarke County",
    "Atlanta-Sandy Springs-Roswell",
    "Augusta-Richmond County",
    "Brunswick",
    "restview-Fort Walton Beach-Destin",
    "Dalton",
    "Hinesville",
    "Macon",
    "Monroe",
    "Rome",
    "Savannah",
    "Valdosta",
    "Warner Robins"
  ]
  ,
  "East Central Divisional GRP Division 5": [
    "Cape Coral-Fort Myers",
    "Deltona-Daytona Beach-Ormond Beach",
    "Gainesville",
    "Homosassa Springs",
    "Jacksonville",
    "Lakeland-Winter Haven",
    "Miami-Fort Lauderdale-Pompano Beach",
    "Naples-Immokalee-Marco Island",
    "North Port-Sarasota-Bradenton",
    "Ocala",
    "Orlando-Kissimmee-Sanford",
    "Palm Bay-Melbourne-Titusville",
    "Panama City",
    "Pensacola-Ferry Pass-Brent",
    "Port St. Lucie",
    "Punta Gorda",
    "Sebring",
    "Tallahassee",
    "Tampa-St. Petersburg-Clearwater",
    "The Villages"
  ]
  ,

  "NEMA Divisional GRP Division 1": [
    "Boston-Cambridge-Newton",
    "Bangor",
    "Barnstable Town",
    "Boston-Cambridge-Nashua",
    "Bridgeport-Stamford-Norwalk",
    "Burlington-South Burlington",
    "Dover-Durham",
    "Hartford-West Hartford-East Hartford",
    "Leominster-Gardner",
    "Lewiston-Auburn",
    "Manchester",
    "New Bedford",
    "New Haven",
    "Norwich-New London-Westerly",
    "Pittsfield",
    "Portland-South Portland",
    "Portsmouth",
    "Providence-Warwick",
    "Springfield",
    "Waterbury",
    "Worcester"
  ]
  ,
  "NEMA Divisional GRP Division 2": [
    "Allentown-Bethlehem-Easton, PA-NJ",
    "Atlantic City-Hammonton",
    "Trenton",
    "Vineland-Bridgeton"
  ]
  ,
  "NEMA Divisional GRP Division 3": [
    "Dover",
    "East Stroudsburg",
    "Gettysburg",
    "Harrisburg-Carlisle",
    "Johnstown",
    "Lancaster",
    "Lebanon",
    "Ocean City",
    "Philadelphia-Camden-Wilmington",
    "Reading",
    "Scranton--Wilkes-Barre--Hazleton",
    "State College",
    "Williamsport",
    "York-Hanover",
    "Youngstown-Warren-Boardman"
  ]
  ,
  "NEMA Divisional GRP Division 4": [
    "Baltimore-Columbia-Towson",
    "Blacksburg-Christiansburg-Radford",
    "Charlottesville",
    "Cumberland",
    "Hagerstown-Martinsburg",
    "Lynchburg",
    "Richmond",
    "Roanoke",
    "Salisbury",
    "Staunton-Waynesboro",
    "Virginia Beach-Norfolk-Newport News",
    "Washington-Arlington-Alexandria"
  ]
  ,
  "NEMA Divisional GRP Division 5": [
    "Ashville",
    "Columbia",
    "Greensboro-High Point",
    "Burlington",
    "Charleston-North Charleston",
    "Charlotte-Concord-Gastonia",
    "Durham-Chapel Hill",
    "Fayetteville",
    "Florence",
    "Goldsboro",
    "Greenville",
    "Greenville-Anderson-Mauldin",
    "Hickory-Lenoir-Morganton",
    "Hilton Head Island-Bluffton-Beaufort",
    "Jacksonville",
    "Myrtle Beach-Conway-North Myrtle Beach",
    "New Bern",
    "Raleigh",
    "Rocky Mount",
    "Spartanburg",
    "Sumter",
    "Wilmington",
    "Winston-Salem"
  ]
  
};

// Statistical Area names for each region
export const regionToStatisticalAreas = {
  West: [
    
      "Abilene",
      "Albuquerque",
      "Amarillo",
      "Anchorage",
      "Bakersfield",
      "Bellingham",
      "Billings",
      "Boise City",
      "Boulder",
      "Bremerton-Silverdale",
      "Broomfield",
      "Brownsville-Harlingen",
      "Carson City",
      "Casper",
      "Cheyenne",
      "Chicago–Naperville–Elgin",
      "Chico",
      "Cleveland–Elyria",
      "Clovis Micropolitan Statistical Area",
      "Coeur d'Alene",
      "Colorado Springs",
      "Corpus Christi",
      "Dallas–Fort Worth–Arlington",
      "Denver-Aurora-Lakewood",
      "El Centro",
      "El Paso",
      "Fairbanks",
      "Farmington",
      "Flagstaff",
      "Fort Collins",
      "Fort Morgan Micropolitan Statistical Area",
      "Fresno",
      "Grand Junction",
      "Great Falls",
      "Greeley",
      "Hanford-Corcoran",
      "Hot Springs",
      "Idaho Falls",
      "Jonesboro",
      "Kahului-Wailuku-Lahaina",
      "Kennewick-Richland",
      "Lake Havasu City-Kingman",
      "Laredo",
      "Las Cruces",
      "Las Vegas-Henderson-Paradise",
      "Levelland Micropolitan Statistical Area",
      "Lewiston",
      "Little Rock-North Little Rock-Conway",
      "Logan",
      "Longview",
      "Los Angeles-Long Beach-Anaheim",
      "Lubbock",
      "Madera",
      "McAllen-Edinburg-Mission",
      "Merced",
      "Midland",
      "Missoula",
      "Modesto",
      "Mount Vernon-Anacortes",
      "Napa",
      "New York–Newark–Jersey City",
      "Odessa",
      "Ogden-Clearfield",
      "Olympia-Tumwater",
      "Oxnard-Thousand Oaks-Ventura",
      "Pampa Micropolitan Statistical Area",
      "Phoenix-Mesa-Scottsdale",
      "Pine Bluff",
      "Pocatello",
      "Prescott",
      "Provo-Orem",
      "Pueblo",
      "Redding",
      "Reno",
      "Riverside-San Bernardino-Ontario",
      "Sacramento-Roseville-Arden-Arcade",
      "Salinas",
      "Salt Lake City",
      "San Angelo",
      "San Diego-Carlsbad",
      "San Francisco-Oakland-Hayward",
      "San Jose-Sunnyvale-Santa Clara",
      "San Luis Obispo-Paso Robles-Arroyo Grande",
      "Santa Barbara",
      "Santa Cruz-Watsonville",
      "Santa Fe",
      "Santa Maria-Santa Barbara",
      "Santa Rosa",
      "Seattle-Tacoma-Bellevue",
      "Sierra Vista-Douglas",
      "Spokane-Spokane Valley",
      "St. George",
      "Sterling Micropolitan Statistical Area",
      "Stockton-Lodi",
      "Tucson",
      "Twin Falls",
      "Urban Honolulu",
      "Vallejo-Fairfield",
      "Visalia-Porterville",
      "Walla Walla",
      "Wenatchee",
      "Yakima",
      "Yuba City",
      "Yuma"
    
  ],

  Central: [
    "Albany",
    "Alexandria",
    "Alice Micropolitan Statistical Area",
    "Ames",
    "Anniston-Oxford-Jacksonville",
    "Appleton",
    "Ardmore Micropolitan Statistical Area",
    "Ashtabula",
    "Auburn-Opelika",
    "Austin-Round Rock",
    "Baton Rouge",
    "Beaumont-Port Arthur",
    "Benavides Micropolitan Statistical Area",
    "Bend-Redmond",
    "Birmingham-Hoover",
    "Bismarck",
    "Bloomington",
    "Brownsville–Harlingen",
    "Brownwood Micropolitan Statistical Area",
    "Bryan-College Station",
    "Cape Girardeau",
    "Carbondale-Marion",
    "Carlsbad Micropolitan Statistical Area",
    "Casper",
    "Cedar Rapids",
    "Champaign-Urbana",
    "Chicago-Naperville-Elgin",
    "Cleveland",
    "Cleveland-Elyria",
    "Columbia",
    "Columbus",
    "Corpus Christi",
    "Corvallis",
    "Dallas-Fort Worth-Arlington",
    "Danville",
    "Daphne-Fairhope-Foley",
    "Davenport-Moline-Rock Island",
    "Decatur",
    "Del Rio Micropolitan Statistical Area",
    "Denver-Aurora-Lakewood",
    "Des Moines-West Des Moines",
    "Dothan",
    "Dubuque",
    "Duluth",
    "Durant Micropolitan Statistical Area",
    "Eagle Pass Micropolitan Statistical Area",
    "Eau Claire",
    "El Paso",
    "Enid",
    "Eugene",
    "Fargo",
    "Fayetteville-Springdale-Rogers",
    "Florence-Muscle Shoals",
    "Fond du Lac",
    "Fort Smith",
    "Fort Worth-Arlington",
    "Gadsden",
    "Grand Forks",
    "Grand Island",
    "Grants Pass",
    "Green Bay",
    "Gulfport-Biloxi-Pascagoula",
    "Hammond",
    "Hattiesburg",
    "Houma-Thibodaux",
    "Houston-The Woodlands-Sugar Land",
    "Huntsville Micropolitan Statistical Area",
    "Huntsville",
    "Iowa City",
    "Jackson",
    "Janesville-Beloit",
    "Jefferson City",
    "Joplin",
    "Kankakee",
    "Kansas City",
    "Kerrville Micropolitan Statistical Area",
    "Killeen-Temple",
    "La Crosse-Onalaska",
    "Lafayette-Opelousas-Morgan City Combined Statistical Area",
    "Lafayette",
    "Lake Charles",
    "Laredo",
    "Laredo Micropolitan Statistical Area",
    "Lawrence",
    "Lawton",
    "Lincoln",
    "Livingston Micropolitan Statistical Area",
    "Longview",
    "Los Angeles-Long Beach-Anaheim",
    "Lubbock",
    "Madison",
    "Manhattan",
    "Mankato-North Mankato",
    "McAllen-Edinburg-Mission",
    "Medford",
    "Memphis",
    "Milwaukee-Waukesha-West Allis",
    "Minneapolis-St. Paul-Bloomington",
    "Mobile",
    "Monroe",
    "Montgomery",
    "Nacogdoches Micropolitan Statistical Area",
    "Natchez Micropolitan Statistical Area",
    "New Orleans-Metairie",
    "Odessa",
    "Ogden-Clearfield",
    "Oklahoma City",
    "Omaha-Council Bluffs",
    "Oshkosh-Neenah",
    "Palestine Micropolitan Statistical Area",
    "Paris Micropolitan Statistical Area",
    "Peoria",
    "Philadelphia-Camden-Wilmington",
    "Pittsburgh",
    "Portland-Vancouver-Hillsboro",
    "Racine",
    "Rapid City",
    "Rochester",
    "Rockford",
    "Sacramento-Roseville-Arden-Arcade",
    "Salem",
    "Salt Lake City",
    "San Antonio-New Braunfels",
    "San Marcos",
    "Sarasota-Bradenton-Venice",
    "Sebastian-Vero Beach",
    "Sheboygan",
    "Sherman-Denison",
    "Shreveport-Bossier City",
    "Sioux City",
    "Sioux Falls",
    "Springfield",
    "St. Cloud",
    "St. George",
    "St. Joseph",
    "St. Louis",
    "Sweetwater Micropolitan Statistical Area",
    "Texarkana",
    "Topeka",
    "Tulsa",
    "Tuscaloosa",
    "Tyler",
    "Victoria",
    "Waco",
    "Waterloo-Cedar Falls",
    "Wausau",
    "Wichita Falls",
    "Youngstown-Warren-Boardman"
],

  "East Central": [
    
      "Akron",
      "Albany-Schenectady-Troy",
      "Albany",
      "Anderson",
      "Ann Arbor",
      "Asheville",
      "Athens-Clarke County",
      "Atlanta-Sandy Springs-Roswell",
      "Augusta-Richmond County",
      "Baltimore-Columbia-Towson",
      "Battle Creek",
      "Bay City",
      "Beckley",
      "Binghamton",
      "Birmingham-Hoover",
      "Bloomington",
      "Boston-Cambridge-Newton",
      "Bowling Green Micropolitan Statistical Area",
      "Bowling Green",
      "Brunswick",
      "Bryan-College Station",
      "Buffalo-Cheektowaga-Niagara Falls",
      "Canton-Massillon",
      "Cape Coral-Fort Myers",
      "Charleston",
      "Chattanooga",
      "Chicago-Naperville-Elgin",
      "Cincinnati",
      "Clarksville",
      "Cleveland-Elyria",
      "Cleveland",
      "Columbia",
      "Columbia Micropolitan Statistical Area",
      "Columbus",
      "Columbus",
      "Cookeville Micropolitan Statistical Area",
      "Crestview-Fort Walton Beach-Destin",
      "Dallas-Fort Worth-Arlington",
      "Dalton",
      "Danville",
      "Dayton",
      "Deltona-Daytona Beach-Ormond Beach",
      "Detroit-Warren-Dearborn",
      "Detroit-Warren-Flint",
      "Elizabethtown-Fort Knox",
      "Elkhart-Goshen",
      "Elmira",
      "Erie",
      "Evansville",
      "Flint",
      "Fort Wayne",
      "Gainesville",
      "Gainesville",
      "Glens Falls",
      "Grand Rapids-Wyoming",
      "Greensboro-High Point",
      "Hinesville",
      "Hohenwald",
      "Homosassa Springs",
      "Houston-The Woodlands-Sugar Land",
      "Huntington-Ashland",
      "Indianapolis-Carmel-Anderson",
      "Ithaca",
      "Jackson",
      "Jacksonville",
      "Johnson City",
      "Kalamazoo-Portage",
      "Killeen-Temple-Fort Hood",
      "Kingsport-Bristol-Bristol",
      "Knoxville",
      "Kokomo",
      "Lafayette",
      "Lafayette-West Lafayette",
      "Lakeland-Winter Haven",
      "Lansing-East Lansing",
      "Lawrenceburg",
      "Lawrenceburg Micropolitan Statistical Area",
      "Lexington-Fayette",
      "Lima",
      "Los Angeles-Long Beach-Anaheim",
      "Louisville/Jefferson County",
      "Macon",
      "Mansfield",
      "McAllen-Edinburg-Mission",
      "McMinnville Micropolitan Statistical Area",
      "Memphis",
      "Miami-Fort Lauderdale-Pompano Beach",
      "Michigan City-La Porte",
      "Midland",
      "Milwaukee-Waukesha-West Allis",
      "Minneapolis-St. Paul-Bloomington",
      "Monroe",
      "Morgantown",
      "Morristown",
      "Muncie Micropolitan Statistical Area",
      "Muncie",
      "Muskegon",
      "Naples-Immokalee-Marco Island",
      "Nashville-Davidson-Murfreesboro-Franklin",
      "New York-Newark-Jersey City",
      "Niles-Benton Harbor",
      "North Port-Sarasota-Bradenton",
      "Ocala",
      "Oklahoma City",
      "Orlando-Kissimmee-Sanford",
      "Owensboro",
      "Palm Bay-Melbourne-Titusville",
      "Panama City",
      "Parkersburg-Vienna",
      "Pensacola-Ferry Pass-Brent",
      "Philadelphia-Camden-Wilmington",
      "Pittsburgh",
      "Port St. Lucie",
      "Punta Gorda",
      "Richmond",
      "Richmond Micropolitan Statistical Area",
      "Rochester",
      "Rome",
      "Saginaw",
      "Salt Lake City",
      "San Antonio-New Braunfels",
      "San Diego–Chula Vista–Carlsbad",
      "Savannah",
      "Sebastian-Vero Beach",
      "Sebring",
      "Shelbyville Micropolitan Statistical Area",
      "South Bend-Mishawaka",
      "Springfield",
      "St. Louis",
      "Syracuse",
      "Tallahassee",
      "Tampa-St. Petersburg-Clearwater",
      "Terre Haute",
      "Texarkana",
      "The Villages",
      "Toledo",
      "Tullahoma-Manchester Micropolitan Statistical Area",
      "Tullahoma–Manchester",
      "Utica-Rome",
      "Valdosta",
      "Warner Robins",
      "Watertown-Fort Drum",
      "Weirton-Steubenville",
      "Wheeling",
      "Wichita Falls"
    
  ],

  East: [
    "Allentown-Bethlehem-Easton, PA-NJ",
    "Asheville, NC",
    "Atlantic City-Hammonton, NJ",
    "Bangor, ME",
    "Barnstable Town, MA",
    "Blacksburg-Christiansburg-Radford, VA",
    "Boston-Cambridge-Nashua, MA-NH",
    "Bridgeport-Stamford-Norwalk, CT",
    "Burlington, NC",
    "Burlington-South Burlington, VT",
    "Charleston-North Charleston, SC",
    "Charlotte-Concord-Gastonia, NC-SC",
    "Charlottesville, VA",
    "Columbia, SC",
    "Cumberland, MD-WV",
    "Danbury, CT",
    "Dover, DE",
    "Dover-Durham, NH-ME",
    "Durham-Chapel Hill, NC",
    "East Stroudsburg, PA",
    "Fayetteville, NC",
    "Florence, SC",
    "Gettysburg, PA",
    "Goldsboro, NC",
    "Greenville, NC",
    "Greenville-Anderson-Mauldin, SC",
    "Hagerstown-Martinsburg, MD-WV",
    "Harrisburg-Carlisle, PA",
    "Hartford-West Hartford-East Hartford, CT",
    "Hickory-Lenoir-Morganton, NC",
    "Hilton Head Island-Bluffton-Beaufort, SC",
    "Jacksonville, NC",
    "Johnstown, PA",
    "Lancaster, PA",
    "Lebanon, PA",
    "Leominster-Gardner, MA",
    "Lewiston-Auburn, ME",
    "Lynchburg, VA",
    "Manchester, NH",
    "Myrtle Beach-Conway-North Myrtle Beach, SC-NC",
    "New Bedford, MA",
    "New Haven, CT",
    "New Bern, NC",
    "New York-Newark-Jersey City, NY-NJ-PA",
    "Norwich-New London-Westerly, CT-RI",
    "Ocean City, NJ",
    "Philadelphia-Camden-Wilmington, PA-NJ-DE-MD",
    "Pittsfield, MA",
    "Portland-South Portland, ME",
    "Portsmouth, NH-ME",
    "Providence-Warwick, RI-MA",
    "Raleigh, NC",
    "Reading, PA",
    "Richmond, VA",
    "Roanoke, VA",
    "Rocky Mount, NC",
    "Salisbury, MD-DE",
    "Scranton--Wilkes-Barre--Hazleton, PA",
    "Spartanburg, SC",
    "Springfield, MA-CT",
    "Staunton-Waynesboro, VA",
    "State College, PA",
    "Sumter, SC",
    "Trenton, NJ",
    "Vineland-Bridgeton, NJ",
    "Virginia Beach-Norfolk-Newport News, VA-NC",
    "Washington-Arlington-Alexandria, DC-VA-MD-WV",
    "Waterbury, CT",
    "Wilmington, NC",
    "Williamsport, PA",
    "Winston-Salem, NC",
    "Worcester, MA-CT",
    "York-Hanover, PA",
    "Youngstown-Warren-Boardman, OH-PA",
  ],
};

// Statistics for each region (consolidated from previous regions)
export const regionStatistics = {
  West: {
    patients: 51230,
    physicianGroups: 5,
    agencies: 170,
    activeOutcomes: 18670,
  },
  Central: {
    patients: 33120,
    physicianGroups: 27,
    agencies: 309,
    activeOutcomes: 9840,
  },
  "East Central": {
    patients: 38750,
    physicianGroups: 7,
    agencies: 37,
    activeOutcomes: 10250,
  },
  East: {
    patients: 42650,
    physicianGroups: 0,
    agencies: 0,
    activeOutcomes: 12330,
  },
};

// Sample statistics for each statistical area
export const statisticalAreaStatistics = {};

// Generate statistics for each statistical area
Object.entries(regionToStatisticalAreas).forEach(([region, areas]) => {
  const regionStats = regionStatistics[region];
  // Distribute the region's statistics among its statistical areas
  const areaCount = areas.length;

  areas.forEach((area, index) => {
    // Create slightly varied statistics for each area
    const variationFactor = 0.7 + Math.random() * 0.6; // Between 0.7 and 1.3

    statisticalAreaStatistics[area] = {
      patients: Math.round(
        (regionStats.patients / areaCount) * variationFactor
      ),
      physicianGroups: Math.round(
        (regionStats.physicianGroups / areaCount) * variationFactor
      ),
      agencies: Math.round(
        (regionStats.agencies / areaCount) * variationFactor
      ),
      activeOutcomes: Math.round(
        (regionStats.activeOutcomes / areaCount) * variationFactor
      ),
    };
  });
});

// Generate a direct mapping from divisional group to statistical areas
export const divisionalGroupToStatisticalAreas = {
  East: [],
  "East Central": [],
  West: [],
  Central: [],
};

// Populate the direct mapping
Object.entries(divisionalGroupToRegions).forEach(
  ([divisionalGroup, regions]) => {
    regions.forEach((region) => {
      const areas = regionToStatisticalAreas[region] || [];
      divisionalGroupToStatisticalAreas[divisionalGroup] = [
        ...divisionalGroupToStatisticalAreas[divisionalGroup],
        ...areas,
      ];
    });
  }
);

// Calculate statistics for each subdivision based on its MSAs
export const getSubdivisionStatistics = (subdivision) => {
  const msas = subdivisionToMSAs[subdivision] || [];
  
  // Initialize totals
  const stats = {
    patients: 0,
    physicianGroups: 0,
    agencies: 0,
    activeOutcomes: 0
  };
  
  // Hardcoded values for East subdivisions
  if (subdivision.startsWith('NEMA Divisional GRP Division')) {
    stats.physicianGroups = 0;
    stats.agencies = 0;
  }
  
  // Hardcoded values for East Central subdivisions
  else if (subdivision === "East Central Divisional GRP Division 1") {
    stats.physicianGroups = 1;
    stats.agencies = 6;
  } else if (subdivision === "East Central Divisional GRP Division 2") {
    stats.physicianGroups = 2;
    stats.agencies = 17;
  } else if (subdivision === "East Central Divisional GRP Division 3") {
    stats.physicianGroups = 2;
    stats.agencies = 2;
  } else if (subdivision === "East Central Divisional GRP Division 4") {
    stats.physicianGroups = 0;
    stats.agencies = 11;
  } else if (subdivision === "East Central Divisional GRP Division 5") {
    stats.physicianGroups = 1;
    stats.agencies = 1;
  }
  
  // Hardcoded values for West subdivisions
  else if (subdivision === "Pacific Northwest Division") {
    stats.physicianGroups = 0;
    stats.agencies = 0;
  } else if (subdivision === "Intermountain Division") {
    stats.physicianGroups = 1;
    stats.agencies = 77;
  } else if (subdivision === "Southwest Division") {
    stats.physicianGroups = 3;
    stats.agencies = 85;
  } else if (subdivision === "LA CA Division") {
    stats.physicianGroups = 1;
    stats.agencies = 7;
  } else if (subdivision === "Bay Area Central CA Division") {
    stats.physicianGroups = 0;
    stats.agencies = 1;
  }
  
  // Hardcoded values for Central subdivisions
  else if (subdivision === "Great Plains Division") {
    stats.physicianGroups = 0;
    stats.agencies = 1;
  } else if (subdivision === "Illinois Wisconsin Division") {
    stats.physicianGroups = 1;
    stats.agencies = 3;
  } else if (subdivision === "Central Division 3") {
    stats.physicianGroups = 0;
    stats.agencies = 8;
  } else if (subdivision === "The South Division") {
    stats.physicianGroups = 0;
    stats.agencies = 35;
  } else if (subdivision === "Central & East Texas Division") {
    stats.physicianGroups = 26;
    stats.agencies = 262;
  }
  
  // Calculate patients and active outcomes from MSAs
  msas.forEach(msa => {
    const msaStats = statisticalAreaStatistics[msa] || {};
    stats.patients += msaStats.patients || 0;
    stats.activeOutcomes += msaStats.activeOutcomes || 0;
  });
  
  return stats;
};

export default {
  regionToDivisionalGroup,
  divisionalGroupToRegions,
  regionToStatisticalAreas,
  divisionalGroupToStatisticalAreas,
  regionStatistics,
  statisticalAreaStatistics,
  getSubdivisionStatistics,
};
