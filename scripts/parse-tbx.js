import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../src/data');

async function processTBXFiles() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.tbx'));
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      if (['termEntry', 'langSet', 'tig', 'descrip', 'term'].indexOf(name) !== -1) return true;
      return false;
    }
  });

  const allEntries = [];
  let globalIdCount = 1;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    try {
      const result = parser.parse(xmlData);
      const title = result?.martif?.martifHeader?.fileDesc?.titleStmt?.title || file.replace('.tbx', '');
      
      const termEntries = result?.martif?.text?.body?.termEntry || [];
      
      termEntries.forEach((entry) => {
        // Extract Subject Field (subcategory)
        let subcategory = 'Orokorra';
        const descrips = entry?.descrip || [];
        for (const desc of descrips) {
          if (desc['@_type'] === 'subjectField') {
            subcategory = desc['#text'];
          }
        }

        const euTerms = [];
        const esTerms = [];
        const frTerms = [];
        const enTerms = [];
        let definition = undefined;

        const langSets = entry?.langSet || [];
        for (const ls of langSets) {
          const lang = ls['@_xml:lang'];
          
          // Extract terms
          const tigs = ls?.tig || [];
          for (const tig of tigs) {
             const terms = tig?.term || [];
             for (const t of terms) {
                const textVal = typeof t === 'object' ? t['#text'] : t;
                if (textVal) {
                   if (lang === 'eu') euTerms.push(textVal);
                   else if (lang === 'es') esTerms.push(textVal);
                   else if (lang === 'fr') frTerms.push(textVal);
                   else if (lang === 'en') enTerms.push(textVal);
                }
             }
          }

          // Extract definition (usually in Basque)
          if (lang === 'eu') {
             const descripGrps = ls?.descripGrp;
             if (descripGrps) {
                // Could be an array or single object
                const grps = Array.isArray(descripGrps) ? descripGrps : [descripGrps];
                for (const g of grps) {
                   const descs = g?.descrip || [];
                   const descArr = Array.isArray(descs) ? descs : [descs];
                   for (const d of descArr) {
                      if (d['@_type'] === 'definition') {
                         definition = d['#text'];
                      }
                   }
                }
             }
          }
        }

        if (euTerms.length > 0) {
           const entryData = {
              id: (globalIdCount++).toString(),
              category: title,
              subcategory,
              euskara: euTerms,
              espanol: esTerms,
              french: frTerms.length > 0 ? frTerms : undefined,
              english: enTerms.length > 0 ? enTerms : undefined,
              definition
           };
           allEntries.push(entryData);
        }
      });
    } catch (err) {
      console.error('Error parsing file:', file, err.message);
    }
  }

  const outStr = JSON.stringify(allEntries, null, 2);
  fs.writeFileSync(path.resolve(DATA_DIR, 'dictionaryData.json'), outStr, 'utf-8');
  console.log(`Successfully compiled ${allEntries.length} entries from ${files.length} TBX files.`);
}

processTBXFiles();
