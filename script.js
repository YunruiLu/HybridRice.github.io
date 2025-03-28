let indexData;

// ¼üÃûºÍµ¥Î»Ìæ»»º¯Êý
function displayKeyName(key) {
    const replacements = {
        'E1': { name: 'Heading date', unit: 'days' },
        'E2': { name: 'Plant height', unit: 'cm' },
        'E3': { name: 'Spikelets per plant', unit: '' }, // ÒÆ³ý count
        'E4': { name: 'Filled grains per plant', unit: '' }, // ÒÆ³ý count
        'E5': { name: 'Spikelets per panicle', unit: '' }, // ÒÆ³ý count
        'E6': { name: 'Filled grains per panicle', unit: '' }, // ÒÆ³ý count
        'E7': { name: 'Seed setting rate', unit: '' },
        'E8': { name: 'Panicle length', unit: 'cm' },
        'E9': { name: 'Spikelet density', unit: '' }, // ÒÆ³ý count/cm
        'E10': { name: 'Tillers per plant', unit: '' }, // ÒÆ³ý count
        'E11': { name: 'Grain length', unit: 'mm' },
        'E12': { name: 'Grain width', unit: 'mm' },
        'E13': { name: 'Grain shape', unit: '' },
        'E14': { name: '1000-grain weight', unit: 'g' },
        'E15': { name: 'Grain yield per plant', unit: 'g' },
        'S1': { name: 'Heading date', unit: 'days' },
        'S2': { name: 'Plant height', unit: 'cm' },
        'S3': { name: 'Spikelets per plant', unit: '' }, // ÒÆ³ý count
        'S4': { name: 'Filled grains per plant', unit: '' }, // ÒÆ³ý count
        'S5': { name: 'Spikelets per panicle', unit: '' }, // ÒÆ³ý count
        'S6': { name: 'Filled grains per panicle', unit: '' }, // ÒÆ³ý count
        'S7': { name: 'Seed setting rate', unit: '' },
        'S8': { name: 'Panicle length', unit: 'cm' },
        'S9': { name: 'Spikelet density', unit: '' }, // ÒÆ³ý count/cm
        'S10': { name: 'Tillers per plant', unit: '' }, // ÒÆ³ý count
        'S11': { name: 'Grain length', unit: 'mm' },
        'S12': { name: 'Grain width', unit: 'mm' },
        'S13': { name: 'Grain shape', unit: '' },
        'S14': { name: '1000-grain weight', unit: 'g' },
        'S15': { name: 'Grain yield per plant', unit: 'g' }
    };
    return replacements[key] || { name: key, unit: '' };
}

async function loadIndex() {
    try {
        console.log('Starting to load index.json');
        const response = await fetch('./data/index.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        indexData = await response.json();
        console.log('index.json loaded successfully:', indexData);

        const parent1List = document.getElementById('parent1List');
        const parent2List = document.getElementById('parent2List');

        indexData.parents1.forEach(p1 => {
            const option = document.createElement('option');
            option.value = p1;
            parent1List.appendChild(option);
        });

        indexData.parents2.forEach(p2 => {
            const option = document.createElement('option');
            option.value = p2;
            parent2List.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load index:', error);
        document.getElementById('ezhouResult').innerHTML = 'Failed to load data, please check the console';
    }
}

async function query() {
    const parent1 = document.getElementById('parent1Input').value.trim();
    const parent2 = document.getElementById('parent2Input').value.trim();
    const key = `${parent1}_${parent2}`;
    console.log('Generated Key:', key);

    const ezhouDiv = document.getElementById('ezhouResult');
    const sanyaDiv = document.getElementById('sanyaResult');
    ezhouDiv.innerHTML = 'Querying...';
    sanyaDiv.innerHTML = '';

    if (!parent1 || !parent2) {
        ezhouDiv.innerHTML = 'Please enter both Parent1 and Parent2';
        return;
    }

    const chunkFile = indexData.mapping[key];
    console.log('Chunk File:', chunkFile);

    if (!chunkFile) {
        ezhouDiv.innerHTML = 'No matching record found';
        return;
    }

    try {
        const response = await fetch(`./data/${chunkFile}`);
        if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
        const chunk = await response.json();
        const result = chunk.find(item => item.P1 === parent1 && item.P2 === parent2);

        if (result) {
            const allKeys = Object.keys(result);
            // Ezhou ±í¸ñ
            let ezhouHtml = '<h3>Ezhou, Hubei Province (Long-day environment)</h3>';
            ezhouHtml += '<table><tr><th>Trait</th><th>Estimated value</th></tr>';
            const ezhouKeys = allKeys.filter(key => key.startsWith('E'));
            for (const key of ezhouKeys) {
                const { name, unit } = displayKeyName(key);
                ezhouHtml += `<tr><td>${name}</td><td>${result[key]}${unit ? ' ' + unit : ''}</td></tr>`;
            }
            ezhouHtml += '</table>';
            ezhouDiv.innerHTML = ezhouHtml;

            // Sanya ±í¸ñ
            let sanyaHtml = '<h3>Sanya, Hainan Province (Short-day environment)</h3>';
            sanyaHtml += '<table><tr><th>Trait</th><th>Estimated value</th></tr>';
            const sanyaKeys = allKeys.filter(key => key.startsWith('S'));
            for (const key of sanyaKeys) {
                const { name, unit } = displayKeyName(key);
                sanyaHtml += `<tr><td>${name}</td><td>${result[key]}${unit ? ' ' + unit : ''}</td></tr>`;
            }
            sanyaHtml += '</table>';
            sanyaDiv.innerHTML = sanyaHtml;
        } else {
            ezhouDiv.innerHTML = 'No matching record found';
        }
    } catch (error) {
        console.error('Query failed:', error);
        ezhouDiv.innerHTML = 'Query failed, please check network or input';
    }
}

window.onload = loadIndex;