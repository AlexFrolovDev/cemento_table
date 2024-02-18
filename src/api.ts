import { IDataRow, ITableColumnsDef, ITableData } from "./types";
const { v4: uuidv4 } = require("uuid");

const LOCAL_STORAGE_KEY = "cemento_data";

/**
 * async to emulate server request
 */
export const getData = async (rowsCount = 500): Promise<{
  rows: ITableData;
  colDefs: ITableColumnsDef;
  groupByColId?: string;
}> => {
  let savedData;
  try {
    savedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) as string);
    if (!savedData) return await fetchData(rowsCount);
    return savedData;
  } catch (e) {
    return await fetchData(rowsCount);
  }
};

export const saveData = (data: {
  rows: ITableData;
  colDefs: ITableColumnsDef;
  groupByColId: string;
}) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
};

export const clearData = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

/**
 * async to emulate DB query
 */
const fetchData = async (
  rowsAmount = 500
): Promise<{
  rows: ITableData;
  colDefs: ITableColumnsDef;
  groupBy: string;
}> => {
  try {
    const rowsData = await fetch("./data/rows.json");
    const colsData = await fetch("./data/colDefs.json");
    const rows = await rowsData.json();
    const colDefs = await colsData.json();

    return {
      rows: (rows as IDataRow[]).slice(0, rowsAmount),
      colDefs,
      groupBy: "",
    };
  } catch (e) {
    return { rows: [], colDefs: [], groupBy: "" };
  }
};

const generateData = async (): Promise<{
  rows: ITableData;
  colDefs: ITableColumnsDef;
  groupBy: string;
}> => {
  const colDefs: ITableColumnsDef = getColDefs();
  const rows: ITableData = generateRows(colDefs);

  return { rows, colDefs, groupBy: "" };
};

export const groupRowsByColumnId = (
  rows: IDataRow[],
  colId: string
): IDataRow[][] => {
  if (!colId) return [];

  const data: IDataRow[][] = [];

  rows.sort((a: IDataRow, b: IDataRow) => {
    if (a[colId] > b[colId]) return 1;
    if (a[colId] < b[colId]) return -1;
    return 0;
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const group = [row];

    while (i < rows.length - 1 && row[colId] === rows[i + 1][colId]) {
      group.push(rows[i + 1]);
      i++;
    }
    data.push(group);
  }

  return data;
};

export const applySearchToData = (rows: IDataRow[], search: string) => {
  if (!search) return rows;
  return rows.filter((row) =>
    Object.values(row).some((v) =>
      v.toString().toLowerCase().includes(search.toLowerCase())
    )
  );
};

const processRows = (rows: IDataRow[] = []): IDataRow[] => {
  const data: IDataRow[] = [];
  const idsToSkip: { [id: string]: boolean } = {};

  //console.log("before: ", rows.length);

  rows.forEach((row, idx) => {
    const _row = { ...row };
    const children: IDataRow[] = [];

    if (!idsToSkip[row.id]) {
      rows.forEach((_row, _idx) => {
        if (idx !== _idx && row.id === _row.id) {
          children.push(_row);
        }
      });
      idsToSkip[row.id] = true;

      if (children.length) {
        _row.children = children;
      }

      data.push(_row);
    }
  });

  //console.log("after: ", data.length);

  return data;
};

const generateRows = (colDefs: ITableColumnsDef = []): ITableData => {
  const data: ITableData = [];

  const fillRandomData = (rowData: IDataRow) => {
    colDefs.forEach((colDef, idx) => {
      switch (idx) {
        case 0:
          rowData[colDef.id] = getRandomFromArray(NAMES);
          break;
        case 1:
          rowData[colDef.id] = Math.floor(Math.random() * 100 + 1);
          break;
        case 2:
          rowData[colDef.id] = getRandomFromArray(BRANCHES);
          break;
        case 3:
          rowData[colDef.id] = getRandomFromArray(POSITIONS);
          break;
        case 4:
          rowData[colDef.id] = getRandomFromArray(EMAILS);
          break;
        case 5:
          rowData[colDef.id] = Math.random() < 0.5;
          break;
        case 6:
          rowData[colDef.id] = Math.floor(Math.random() * 80 + 18);
          break;
      }
    });
  };

  for (let i = 0; i < 2000; i++) {
    const rowId = uuidv4();

    const rowData: IDataRow = {
      id: rowId,
    };

    // Some ugly hardcode, but no data, so -,-...
    fillRandomData(rowData);

    data.push(rowData);

    /* const shouldAddChildren = Math.random() < 0.5;

    // Lets add some children also wth same rowId
    if (shouldAddChildren) {
      const rowsAmount = Math.floor(Math.random() * 10);
      for (let j = 0; j < rowsAmount; j++) {
        const rowData: IDataRow = {
          id: rowId,
        };

        fillRandomData(rowData);

        data.push(rowData);
      }
    } */
  }

  return data;
};

const getColDefs = (): ITableColumnsDef => {
  const colDefs: ITableColumnsDef = [];

  colDefs.push({
    id: uuidv4(),
    ordinalNo: 0,
    title: "Name",
    type: "string",
    summaryAggregation: "total",
    visible: true,
  });
  colDefs.push({
    id: uuidv4(),
    ordinalNo: 1,
    title: "Points",
    type: "number",
    summaryAggregation: "sum",
    visible: true,
  });
  colDefs.push({
    id: uuidv4(),
    ordinalNo: 2,
    title: "Branch",
    type: "list",
    summaryAggregation: "total",
    visible: true,
    listOptions: BRANCHES.map((branch, idx) => {
      return {
        key: idx.toString(),
        value: branch,
      };
    }),
  });
  colDefs.push({
    id: uuidv4(),
    ordinalNo: 3,
    title: "Position",
    type: "list",
    summaryAggregation: "total",
    visible: true,
    listOptions: POSITIONS.map((position, idx) => {
      return {
        key: idx.toString(),
        value: position,
      };
    }),
  });
  colDefs.push({
    id: uuidv4(),
    ordinalNo: 4,
    title: "Email",
    type: "string",
    summaryAggregation: "total",
    visible: true,
  });
  colDefs.push({
    id: uuidv4(),
    ordinalNo: 5,
    title: "Available",
    type: "boolean",
    summaryAggregation: "list",
    visible: true,
  });
  colDefs.push({
    id: uuidv4(),
    ordinalNo: 6,
    title: "Age",
    type: "number",
    summaryAggregation: "total",
    visible: true,
  });

  return colDefs;
};

const getRandomFromArray = (array: string[] = []) => {
  return array[Math.floor(Math.random() * array.length)];
};

const NAMES = [
  "Anastasia Stewart",
  "Wendi Slater",
  "Alexander Brooks",
  "Kristina Oconnor",
  "Tia Hutchinson",
  "Sondra Greer",
  "Audra Howard",
  "Cheri Hall",
  "Cruz Dawson",
  "Esperanza Hayes",
  "Gina Lawson",
  "Suzette Randolph",
  "Love Gamble",
  "Baker Lang",
  "Raymond Solomon",
  "Malinda Shannon",
  "Kaitlin Peters",
  "Lucile Carney",
  "Pennington Kemp",
  "Josephine Schmidt",
  "Moses Donaldson",
  "Walker Pittman",
  "Jody Hart",
  "Selma Rosa",
  "Barber Bernard",
  "Julia Bryant",
  "Clay Mullins",
  "Ashlee Bass",
  "Brooke Warren",
  "Justice Nixon",
  "Washington Phillips",
  "Hahn Herring",
  "Jillian Winters",
  "Clayton Burks",
  "Lee Anderson",
  "English Cantu",
  "Alexandria Chan",
  "Josefa Saunders",
  "Shields Stuart",
  "Liz Daniel",
  "Jodie Stevenson",
  "Jimmie Howell",
  "Reed William",
  "Wells Morin",
  "Bertha Gutierrez",
  "Morrison Barker",
  "Berta Cross",
  "Winters Avery",
  "Patton Crawford",
  "Schmidt Wiley",
  "Arlene Mccoy",
  "Mooney Conway",
  "Chen Jacobs",
  "Battle Foreman",
  "Sherrie Sullivan",
  "Steele Torres",
  "Adeline Kent",
  "Turner Dorsey",
  "Shauna Bradford",
  "Talley Doyle",
  "Rosalind Webster",
  "Lorraine Fuller",
  "Maryellen Ayers",
  "Hunt Lamb",
  "Cunningham Pierce",
  "Amanda Watson",
  "Jeri Guerra",
  "Hill Parks",
  "Marisa Chase",
  "Charity Mcconnell",
  "Meredith Dunn",
  "Trujillo Page",
  "Aguilar Nolan",
  "Georgina Calhoun",
  "Gayle Benton",
  "Amie Atkins",
  "Carroll Hernandez",
  "Hood Benson",
  "Lewis Atkinson",
  "Russell Lee",
  "Cole Romero",
  "Horne Douglas",
  "Wilder Garza",
  "Burnett Glass",
  "Boyle Stone",
  "Angel Le",
  "Jayne Mason",
  "Mckee Mcgowan",
  "Ruth Frye",
  "John Witt",
  "Crosby Baker",
  "Hardy Snow",
  "Lopez Hebert",
  "Ratliff Macias",
  "Joni Mcfarland",
  "Leblanc Craft",
  "Earline Russo",
  "Tami Cline",
  "Robinson Cohen",
  "Lawson Roy",
  "Pam Buckner",
  "Susan Armstrong",
  "Garcia Malone",
  "Harvey Keith",
  "Swanson Hubbard",
  "Davis Dixon",
  "Nichole Jordan",
  "Jewell Blanchard",
  "Bonita Irwin",
  "Deirdre Myers",
  "Dorothea Schneider",
  "Wynn Norton",
  "Guadalupe Knowles",
  "Myrtle Kelly",
  "Whitney Carrillo",
  "Mcfadden Nash",
  "Eloise Kidd",
  "Mabel Miles",
  "Shannon Mercado",
  "Beulah Morgan",
  "Rena Morrow",
  "Stella Deleon",
  "Ada Ayala",
  "Jean Velasquez",
  "Guthrie Stafford",
  "Mayer Mcgee",
  "Tabatha Gibson",
  "Bruce Cote",
  "Lott Mcguire",
  "Madelyn Burt",
  "Horn Hines",
  "Joy Bonner",
  "Enid Barnett",
  "Mcdowell Hooper",
  "Moss Benjamin",
  "Valarie Ellison",
  "Vicki Herrera",
  "Deborah Harrison",
  "Chaney Harrell",
  "Beard Simpson",
  "Karen Mack",
  "Mcgowan Sanders",
  "Stuart Melendez",
  "Heath Dejesus",
  "Obrien Fleming",
  "Burt Avila",
  "Rosario Solis",
  "Irma Carey",
  "Bettie Mooney",
  "Avery Noel",
  "Brenda Rose",
  "Eaton Talley",
  "Ofelia Oneal",
  "Romero Leach",
  "Cara Castaneda",
  "Kennedy Lambert",
  "Aurora Munoz",
  "Rosemarie Holden",
  "Rosario Aguilar",
  "Joyner Mckenzie",
  "Skinner Foster",
  "Chase Stephenson",
  "Jessie Cooke",
  "Nichols Todd",
  "Charlotte Hamilton",
  "Gordon Riley",
  "Lena Andrews",
  "Jocelyn Dennis",
  "Shaffer Franklin",
  "Tamra Larsen",
  "Alejandra Rodriquez",
  "Craig Booker",
  "Flossie Pratt",
  "Dina Rivers",
  "Mia Dale",
  "Duke Stephens",
  "Blanchard Lester",
  "Rasmussen Bennett",
  "Irene Wilcox",
  "Jamie Buck",
  "Mallory Morse",
  "Roseann Villarreal",
  "West Russell",
  "Nellie Young",
  "Jackson Wolfe",
  "Tara Hoffman",
  "Campos Shepherd",
  "Patel Robbins",
  "Kirkland Copeland",
  "Hammond Rivera",
  "Bryan Waller",
  "Janelle Zimmerman",
  "Fletcher Nielsen",
  "Melva Martin",
  "Knowles Dunlap",
  "Danielle Maldonado",
  "Guerrero Figueroa",
  "Kathrine Ryan",
  "Marla Ramsey",
  "Sabrina Richmond",
  "Alexandra Forbes",
  "Reva Gray",
  "Payne Pruitt",
  "Debora Collins",
  "Pace Freeman",
  "Rios Austin",
  "Letha Snider",
  "Sonia Wagner",
  "Helga Love",
  "Frederick Herman",
  "Thomas Vasquez",
  "Albert Gordon",
  "Mitzi Maddox",
  "Fern Cabrera",
  "Vickie Fields",
  "Richmond Walker",
  "Sims Bright",
  "Ashley Carroll",
  "Christian Glenn",
  "Moore Garcia",
  "Conley Kirby",
  "Eleanor Dotson",
  "Mcmahon Floyd",
  "Bessie Shaffer",
  "Bentley Mueller",
  "Elba Odonnell",
  "Jordan Hammond",
  "Kent Willis",
  "Lidia Williamson",
  "Bernice Acosta",
  "Pickett Alvarado",
  "Mccall Holt",
  "Becker Gonzalez",
  "Marissa Patel",
  "Salazar Nelson",
  "Evans Prince",
  "Boone Long",
  "Rodriquez Kirk",
  "Butler Tucker",
  "Tamika Goodman",
  "Fischer May",
  "Bridgett Rowland",
  "Laurel Christian",
  "Wise Levy",
  "Tammy Madden",
  "Wilkinson Burnett",
  "Mason Walls",
  "Mosley Mendoza",
  "Gregory Wall",
  "Gomez Ray",
  "Mara Tyler",
  "Carey Charles",
  "Terry Dean",
  "Trudy Ortega",
  "Woodard Moran",
  "Wiggins Stout",
  "Solomon Lindsay",
  "Barron Neal",
  "Joann Rice",
  "Richards Sampson",
  "Kenya Kline",
  "Barrett Bartlett",
  "Rosemary Weber",
  "Russo Hogan",
  "Jasmine Kelley",
  "Kathleen Wade",
  "Tabitha Juarez",
  "Katy Steele",
  "Willa Finch",
  "Imogene Wynn",
  "Case Faulkner",
  "King Orr",
  "Peterson Sheppard",
  "Suzanne Navarro",
  "Stephens Bates",
  "Latoya Gregory",
  "Myra Weaver",
  "Dominguez Caldwell",
  "Natasha Ross",
  "Fry Duffy",
  "Christine Cherry",
  "Gill Rasmussen",
  "Lorene Vega",
  "Fanny Grant",
  "Jacquelyn Cole",
  "Schneider Boyd",
  "Jodi Barnes",
  "Chambers Hunt",
  "Earlene Chang",
  "Robbie Burke",
  "Ester Carson",
  "Mercedes Randall",
  "Jimenez Roberts",
  "Bishop Vaughn",
  "Virginia Gardner",
  "Eddie Bond",
  "Rita Lucas",
  "Nannie Merritt",
  "Penelope Mckinney",
  "Lolita Roberson",
  "Roxie Huffman",
  "Brennan Sweeney",
  "Patrice Franks",
  "Hopper Vazquez",
  "Rhoda Ratliff",
  "Hilda Sellers",
  "Gould Macdonald",
  "Nixon Blake",
  "Krystal Schroeder",
  "Shawna Levine",
  "Carissa Fox",
  "Kimberley Buchanan",
  "Twila Valentine",
  "Vinson Watts",
  "Soto Morris",
  "Willie Moss",
  "Coffey Boyle",
  "Fuentes Cardenas",
  "Aurelia Carpenter",
  "Bridgette Ortiz",
  "Emily Mcdaniel",
  "Helena Langley",
  "Livingston Jennings",
  "Tricia Yang",
  "Cecile Farley",
  "Amalia Perkins",
  "Lorrie Serrano",
  "Sara Jackson",
  "Brandi Delaney",
  "Amber Parsons",
  "Brigitte Cash",
  "Myrna Mcneil",
  "Cathy Guy",
  "Finch Barrera",
  "Taylor Wilkins",
  "Howard Perez",
  "Quinn Cobb",
  "Tamera Horne",
  "Humphrey Mathews",
  "Frazier Alvarez",
  "Camacho Ferrell",
  "Rodgers Garner",
  "Gray Reed",
  "Hyde Bean",
  "Barrera Clay",
  "Winifred Hale",
  "Cain Barron",
  "Blanca Mathis",
  "Gentry Mills",
  "Juana Jimenez",
  "Jeanette Olsen",
  "Corina Mcmahon",
  "Jewel Hicks",
  "Lauri Branch",
  "Sutton Ochoa",
  "Lenore Morton",
  "Oneill Rojas",
  "Houston Browning",
  "Joan Rosales",
  "Terrie Miranda",
  "Church Barton",
  "Rosalie Mayer",
  "Shelton Ingram",
  "Manning Swanson",
  "Savannah Stein",
  "Trina Harmon",
  "Smith Bradley",
  "Hendrix Holman",
  "Misty Elliott",
  "Morris Bolton",
  "Decker Brown",
  "Roman Powers",
  "Lynda Parrish",
  "Lee Velazquez",
];

const EMAILS = [
  "valariequinn@iplax.com",
  "johnrice@iplax.com",
  "bradleybaldwin@iplax.com",
  "thompsonchase@iplax.com",
  "amberelliott@iplax.com",
  "forbeswebster@iplax.com",
  "chensnyder@iplax.com",
  "vegameyer@iplax.com",
  "pattersonmcneil@iplax.com",
  "shellyhickman@iplax.com",
  "hodgecoleman@iplax.com",
  "dyerbarton@iplax.com",
  "bobbifoster@iplax.com",
  "schmidtwilkerson@iplax.com",
  "jamirivers@iplax.com",
  "stokesblankenship@iplax.com",
  "evemoses@iplax.com",
  "virginiagill@iplax.com",
  "taylormcdonald@iplax.com",
  "mcknightbutler@iplax.com",
  "victoriabradshaw@iplax.com",
  "webstertrevino@iplax.com",
  "debrataylor@iplax.com",
  "mcconnellbrewer@iplax.com",
  "beanparks@iplax.com",
  "abbykennedy@iplax.com",
  "carneyvaughan@iplax.com",
  "tiawatkins@iplax.com",
  "frankscontreras@iplax.com",
  "crawfordbradley@iplax.com",
  "sheenasharp@iplax.com",
  "jerilindsay@iplax.com",
  "yanghart@iplax.com",
  "brockleach@iplax.com",
  "nataliasolomon@iplax.com",
  "douglasramos@iplax.com",
  "molliemiles@iplax.com",
  "hildapowell@iplax.com",
  "rosaliebarber@iplax.com",
  "elainefox@iplax.com",
  "gracereynolds@iplax.com",
  "bondmorales@iplax.com",
  "sherylwoods@iplax.com",
  "briannagarrison@iplax.com",
  "marahawkins@iplax.com",
  "gladysvaldez@iplax.com",
  "callahanyang@iplax.com",
  "suarezdickson@iplax.com",
  "ednawells@iplax.com",
  "richdyer@iplax.com",
  "stellabrennan@iplax.com",
  "augustanixon@iplax.com",
  "sykespena@iplax.com",
  "coleenlevine@iplax.com",
  "townsendrobertson@iplax.com",
  "knappolsen@iplax.com",
  "ellischang@iplax.com",
  "conwaygonzales@iplax.com",
  "marianbrock@iplax.com",
  "violageorge@iplax.com",
  "berryhyde@iplax.com",
  "dionnemaynard@iplax.com",
  "tanyaboyle@iplax.com",
  "henriettasampson@iplax.com",
  "jordantyson@iplax.com",
  "irwinfrye@iplax.com",
  "marquitavillarreal@iplax.com",
  "hullshannon@iplax.com",
  "jeanetterollins@iplax.com",
  "dawsonfaulkner@iplax.com",
  "tanialancaster@iplax.com",
  "merrittsantana@iplax.com",
  "elnoraserrano@iplax.com",
  "marcieroberson@iplax.com",
  "ballarderickson@iplax.com",
  "maxinehahn@iplax.com",
  "patricebell@iplax.com",
  "murielwilkins@iplax.com",
  "vaughanwarner@iplax.com",
  "deboracurry@iplax.com",
  "lowerycase@iplax.com",
  "hewittheath@iplax.com",
  "bergbates@iplax.com",
  "kendrahicks@iplax.com",
  "elbaramirez@iplax.com",
  "catalinaenglish@iplax.com",
  "pollypope@iplax.com",
  "welchryan@iplax.com",
  "parrishsanchez@iplax.com",
  "leablair@iplax.com",
  "colleenhays@iplax.com",
  "gallowayrush@iplax.com",
  "claudineholt@iplax.com",
  "elvasargent@iplax.com",
  "kellerhammond@iplax.com",
  "hallieschmidt@iplax.com",
  "hahnjimenez@iplax.com",
  "cummingshamilton@iplax.com",
  "buckdowns@iplax.com",
  "dorseyrobles@iplax.com",
  "danielsellis@iplax.com",
  "linaaustin@iplax.com",
  "ortizfreeman@iplax.com",
  "wilkersonstark@iplax.com",
  "marionknowles@iplax.com",
  "stephensyork@iplax.com",
  "weisscolon@iplax.com",
  "kelseyrocha@iplax.com",
  "raqueljohnson@iplax.com",
  "hoffmanalbert@iplax.com",
  "bairdandrews@iplax.com",
  "pansygamble@iplax.com",
  "newtonpennington@iplax.com",
  "oliviale@iplax.com",
  "lewispadilla@iplax.com",
  "maciashoover@iplax.com",
  "moodycharles@iplax.com",
  "duffygreen@iplax.com",
  "karlalowery@iplax.com",
  "savannahjenkins@iplax.com",
  "spenceblevins@iplax.com",
  "roxiepearson@iplax.com",
  "cathymorrow@iplax.com",
  "hickmanmccormick@iplax.com",
  "marcisandoval@iplax.com",
  "doriscarroll@iplax.com",
  "denakline@iplax.com",
  "esmeraldawhitney@iplax.com",
  "oliverpaul@iplax.com",
  "hillbartlett@iplax.com",
  "williethompson@iplax.com",
  "bobbiehess@iplax.com",
  "triciaacevedo@iplax.com",
  "roseannmiranda@iplax.com",
  "powellcoffey@iplax.com",
  "imeldavasquez@iplax.com",
  "summersdonovan@iplax.com",
  "jeweldaniel@iplax.com",
  "cainluna@iplax.com",
  "nielsensoto@iplax.com",
  "gloriakelley@iplax.com",
  "dunlapcunningham@iplax.com",
  "maylawrence@iplax.com",
  "schultzfrancis@iplax.com",
  "ashleyanderson@iplax.com",
  "holmancrosby@iplax.com",
  "hendersonmacias@iplax.com",
  "rowenaosborne@iplax.com",
  "carlycompton@iplax.com",
  "aimeestevens@iplax.com",
  "tysonholcomb@iplax.com",
  "armstrongsalas@iplax.com",
  "hensonherman@iplax.com",
  "vanessastein@iplax.com",
  "dellacopeland@iplax.com",
  "tamihanson@iplax.com",
  "clemonsrusso@iplax.com",
  "beckerortiz@iplax.com",
  "marissakey@iplax.com",
  "almabonner@iplax.com",
  "addiehorton@iplax.com",
  "beatricevalencia@iplax.com",
  "foremanwitt@iplax.com",
  "velazquezolson@iplax.com",
  "mathewsvance@iplax.com",
  "maringuyen@iplax.com",
  "santiagobenton@iplax.com",
  "barrerapacheco@iplax.com",
  "cindymcpherson@iplax.com",
  "austinmejia@iplax.com",
  "ayersrichard@iplax.com",
  "ryanwalters@iplax.com",
  "stevensonjacobs@iplax.com",
  "christensenflores@iplax.com",
  "richardpreston@iplax.com",
  "magdalenamorris@iplax.com",
  "adkinsmathis@iplax.com",
  "warnerbrown@iplax.com",
  "nashknight@iplax.com",
  "hobbsschneider@iplax.com",
  "shariglass@iplax.com",
  "bradymontoya@iplax.com",
  "aguilarrodriquez@iplax.com",
  "pughmclean@iplax.com",
  "nicholewinters@iplax.com",
  "christiannorton@iplax.com",
  "bullockavila@iplax.com",
  "whitakermooney@iplax.com",
  "jacquelinerichards@iplax.com",
  "baxterwilliamson@iplax.com",
  "priscillahebert@iplax.com",
  "marsharay@iplax.com",
  "rosariolove@iplax.com",
  "patelhartman@iplax.com",
  "tuckerunderwood@iplax.com",
  "romeromccarthy@iplax.com",
  "avilagilliam@iplax.com",
  "daleleblanc@iplax.com",
  "maurastout@iplax.com",
  "maldonadocaldwell@iplax.com",
  "inaatkins@iplax.com",
  "petersenbarron@iplax.com",
  "ivycardenas@iplax.com",
  "sarahuff@iplax.com",
  "andersonnicholson@iplax.com",
  "burtreid@iplax.com",
  "kimberleylucas@iplax.com",
  "evangelinewall@iplax.com",
  "annmarietran@iplax.com",
  "hendrixbuckley@iplax.com",
  "arnoldmoran@iplax.com",
  "krisallison@iplax.com",
  "brittanysalinas@iplax.com",
  "julietbarry@iplax.com",
  "gallegospruitt@iplax.com",
  "estellafields@iplax.com",
  "wattsnieves@iplax.com",
  "blackburngordon@iplax.com",
  "olivedawson@iplax.com",
  "walterscarr@iplax.com",
  "millerhewitt@iplax.com",
  "frosthatfield@iplax.com",
  "cynthiabird@iplax.com",
  "bettesteele@iplax.com",
  "pearlgolden@iplax.com",
  "hartmanhurst@iplax.com",
  "virgieroy@iplax.com",
  "salliesnider@iplax.com",
  "fowlerwood@iplax.com",
  "fitzpatrickmason@iplax.com",
  "leolagarner@iplax.com",
  "lauribryan@iplax.com",
  "edithburnett@iplax.com",
  "margeryrobbins@iplax.com",
  "pattonchaney@iplax.com",
  "arlinepetersen@iplax.com",
  "russoholmes@iplax.com",
  "rasmussenevans@iplax.com",
  "diannamolina@iplax.com",
  "grossgarza@iplax.com",
  "riosayala@iplax.com",
  "stuartguthrie@iplax.com",
  "joansolis@iplax.com",
  "kiddboone@iplax.com",
  "effieblackwell@iplax.com",
  "nolaowen@iplax.com",
  "susannawyatt@iplax.com",
  "paigeriley@iplax.com",
  "geraldinefletcher@iplax.com",
  "robertspickett@iplax.com",
  "sashalindsey@iplax.com",
  "marjoriewilson@iplax.com",
  "rowewhitley@iplax.com",
  "mariewatson@iplax.com",
  "benderferrell@iplax.com",
  "norrispate@iplax.com",
  "dorotheahowell@iplax.com",
  "annetteskinner@iplax.com",
  "alycehayden@iplax.com",
  "tarajohnston@iplax.com",
  "brewercamacho@iplax.com",
  "rosalindpark@iplax.com",
  "louisalynch@iplax.com",
  "farleymorton@iplax.com",
  "orrmendoza@iplax.com",
  "gentrygood@iplax.com",
  "pearsonlogan@iplax.com",
  "reynavaughn@iplax.com",
  "diannetate@iplax.com",
  "margretgoodman@iplax.com",
  "rileyknox@iplax.com",
  "hoganherring@iplax.com",
  "maxwellatkinson@iplax.com",
  "monacantrell@iplax.com",
  "tammieballard@iplax.com",
  "warrenwest@iplax.com",
  "chelseabarnett@iplax.com",
  "mirandarodgers@iplax.com",
  "ameliabeck@iplax.com",
  "friedarussell@iplax.com",
  "marilynyates@iplax.com",
  "patriciaberry@iplax.com",
  "beckfuller@iplax.com",
  "kempwade@iplax.com",
  "vanceshelton@iplax.com",
  "deloristillman@iplax.com",
  "whitneycox@iplax.com",
  "belindahughes@iplax.com",
  "langleythomas@iplax.com",
  "esthertodd@iplax.com",
  "petrahodges@iplax.com",
  "deckermerritt@iplax.com",
  "valenciavega@iplax.com",
  "laurelmcfadden@iplax.com",
  "whitfieldpugh@iplax.com",
  "deanaware@iplax.com",
  "gabriellemcbride@iplax.com",
  "nikkirich@iplax.com",
  "odessamontgomery@iplax.com",
  "aishafitzgerald@iplax.com",
  "kathrynpuckett@iplax.com",
  "veranorman@iplax.com",
  "bertienelson@iplax.com",
  "salinashardin@iplax.com",
  "valeriecarlson@iplax.com",
  "nguyenjoyce@iplax.com",
  "contrerasbauer@iplax.com",
  "mavischavez@iplax.com",
  "staciwalker@iplax.com",
  "kathiegross@iplax.com",
  "terrystevenson@iplax.com",
  "carolashley@iplax.com",
  "chapmancochran@iplax.com",
  "markshouston@iplax.com",
  "blevinsyoung@iplax.com",
  "franklee@iplax.com",
  "tammiarmstrong@iplax.com",
  "micheleburke@iplax.com",
  "joycebarnes@iplax.com",
  "cashboyer@iplax.com",
  "calhounmueller@iplax.com",
  "barlowmcclain@iplax.com",
  "carlsonlester@iplax.com",
  "rubyhutchinson@iplax.com",
  "celestebattle@iplax.com",
  "barronwise@iplax.com",
  "suttonsutton@iplax.com",
  "velasquezparker@iplax.com",
  "simmonsoneil@iplax.com",
  "fordjames@iplax.com",
  "mariapowers@iplax.com",
  "jonihinton@iplax.com",
  "francodennis@iplax.com",
  "bethanystuart@iplax.com",
  "madgesharpe@iplax.com",
  "grimeswoodward@iplax.com",
  "bateswillis@iplax.com",
  "vernaklein@iplax.com",
  "cobbholloway@iplax.com",
  "britneyscott@iplax.com",
  "deenahayes@iplax.com",
  "herminiadickerson@iplax.com",
  "brennanbowen@iplax.com",
  "betsybishop@iplax.com",
  "bartlettshepherd@iplax.com",
  "tommiebray@iplax.com",
  "raymondprince@iplax.com",
  "blairstephens@iplax.com",
  "morrisweeks@iplax.com",
  "kristiemarshall@iplax.com",
  "owensgillespie@iplax.com",
  "shepherdestes@iplax.com",
  "randigonzalez@iplax.com",
  "barbercrawford@iplax.com",
  "lynnmcdaniel@iplax.com",
  "pittmanmoon@iplax.com",
  "mandywalter@iplax.com",
  "elizamatthews@iplax.com",
  "herreralambert@iplax.com",
  "trevinowilcox@iplax.com",
  "jillianknapp@iplax.com",
  "lindsaysantiago@iplax.com",
  "tamekadillon@iplax.com",
  "guerrabruce@iplax.com",
  "kristyhoffman@iplax.com",
  "sylviaraymond@iplax.com",
  "karawilliams@iplax.com",
  "caroleterrell@iplax.com",
  "matthewsrowe@iplax.com",
  "guerrerobarker@iplax.com",
  "erinabbott@iplax.com",
  "beulahmckinney@iplax.com",
  "melissapittman@iplax.com",
  "michellewhitaker@iplax.com",
  "maryannwashington@iplax.com",
  "lawandagalloway@iplax.com",
  "sadiebailey@iplax.com",
  "harriettturner@iplax.com",
  "maddoxleonard@iplax.com",
  "wellseverett@iplax.com",
  "flemingjohns@iplax.com",
  "beachstanton@iplax.com",
  "fernmiller@iplax.com",
  "stricklandkemp@iplax.com",
  "lavernebarlow@iplax.com",
  "rosanneharrington@iplax.com",
  "juarezmelendez@iplax.com",
  "annstewart@iplax.com",
  "daisygrimes@iplax.com",
  "blackwellcooley@iplax.com",
  "sallyross@iplax.com",
  "melanieball@iplax.com",
  "rosamaxwell@iplax.com",
  "kaylasykes@iplax.com",
  "figueroanorris@iplax.com",
  "anastasiafinch@iplax.com",
  "shereebentley@iplax.com",
  "vazquezleon@iplax.com",
  "violetgilbert@iplax.com",
  "lilianmullins@iplax.com",
  "comptonmcgee@iplax.com",
  "gonzalezhopkins@iplax.com",
  "melindahogan@iplax.com",
  "cortezwilkinson@iplax.com",
  "ernaswanson@iplax.com",
  "ashleecastaneda@iplax.com",
  "paulettearnold@iplax.com",
  "whitneyconrad@iplax.com",
  "daltonkirby@iplax.com",
  "marthaaguilar@iplax.com",
  "ethelcash@iplax.com",
  "kelleycervantes@iplax.com",
  "renasmall@iplax.com",
  "jacobscline@iplax.com",
  "coffeygoodwin@iplax.com",
  "searsbaker@iplax.com",
  "butlerwolfe@iplax.com",
  "traciealexander@iplax.com",
  "jerrynunez@iplax.com",
  "maryfitzpatrick@iplax.com",
  "kinneycallahan@iplax.com",
  "prestonmonroe@iplax.com",
  "madelinemartinez@iplax.com",
  "jacklynlarsen@iplax.com",
  "josefinaconner@iplax.com",
  "dominguezpalmer@iplax.com",
  "mitzidavenport@iplax.com",
  "craneclayton@iplax.com",
  "rosettameyers@iplax.com",
  "carmencotton@iplax.com",
  "cotecraft@iplax.com",
  "allysonbenjamin@iplax.com",
  "maischultz@iplax.com",
  "drakedelgado@iplax.com",
  "katharinehancock@iplax.com",
  "bonneroconnor@iplax.com",
  "alexanderstrong@iplax.com",
  "noemimcknight@iplax.com",
  "frederickstone@iplax.com",
  "middletonmadden@iplax.com",
  "bowerslevy@iplax.com",
  "eatonlloyd@iplax.com",
  "willajennings@iplax.com",
  "stephensonruiz@iplax.com",
  "bridgetstephenson@iplax.com",
  "mcbridewolf@iplax.com",
  "chambersrojas@iplax.com",
  "torresbaird@iplax.com",
  "longwalton@iplax.com",
  "mcleanpeterson@iplax.com",
  "nevafleming@iplax.com",
  "ninaparrish@iplax.com",
  "nicholswiley@iplax.com",
  "taylordale@iplax.com",
  "elsierogers@iplax.com",
  "manuelabyrd@iplax.com",
  "mcgeedodson@iplax.com",
  "bassochoa@iplax.com",
  "bridgettbender@iplax.com",
  "beverlyfranklin@iplax.com",
  "isabellagates@iplax.com",
  "genevaphillips@iplax.com",
  "ortegacarrillo@iplax.com",
  "kerrcameron@iplax.com",
  "downsperez@iplax.com",
  "stonebritt@iplax.com",
  "reynoldsbranch@iplax.com",
  "cherylestrada@iplax.com",
  "cassieweiss@iplax.com",
  "cookcross@iplax.com",
  "sandovalratliff@iplax.com",
  "karynfulton@iplax.com",
  "talleywebb@iplax.com",
  "margueritethornton@iplax.com",
  "blanchefloyd@iplax.com",
  "karenengland@iplax.com",
  "juliannemacdonald@iplax.com",
  "englishgarrett@iplax.com",
  "combsdavis@iplax.com",
  "barnettgibson@iplax.com",
  "hortonbennett@iplax.com",
  "dennisconway@iplax.com",
  "luanncasey@iplax.com",
  "cherrybowers@iplax.com",
  "patebernard@iplax.com",
  "noramcdowell@iplax.com",
  "veronicaforeman@iplax.com",
  "allisonkirkland@iplax.com",
  "wilderdeleon@iplax.com",
  "lucilleforbes@iplax.com",
  "gainesreese@iplax.com",
];

const POSITIONS = [
  "Developer",
  "Product Manager",
  "QA",
  "Accountant",
  "Jack Sparrow",
  "Robert Paulsen",
  "Leeroy Jenkins",
];

const BRANCHES = ["New York", "LA", "Tel Aviv", "Singapore", "Kyiv", "London"];
