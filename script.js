let indexData;

// 键名替换函数
function displayKeyName(key) {
    const replacements = {
        'E1': 'Heading date',
        'E2': 'Plant height',
        'E3': 'Spikelets per plant',
        'E4': 'Filled grains per plant',
        'E5': 'Spikelets per panicle',
        'E6': 'Filled grains per panicle',
        'E7': 'Seed setting rate',
        'E8': 'Panicle length',
        'E9': 'Spikelet density',
        'E10': 'Tillers per plant',
        'E11': 'Grain length',
        'E12': 'Grain width',
        'E13': 'Grain shape',
        'E14': '1000-grain weight',
        'E15': 'Grain yield per plant',
        'S1': 'Heading date',
        'S2': 'Plant height',
        'S3': 'Spikelets per plant',
        'S4': 'Filled grains per plant',
        'S5': 'Spikelets per panicle',
        'S6': 'Filled grains per panicle',
        'S7': 'Seed setting rate',
        'S8': 'Panicle length',
        'S9': 'Spikelet density',
        'S10': 'Tillers per plant',
        'S11': 'Grain length',
        'S12': 'Grain width',
        'S13': 'Grain shape',
        'S14': '1000-grain weight',
        'S15': 'Grain yield per plant'
    };
    return replacements[key] || key;
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
            // Ezhou 表格
            let ezhouHtml = '<h3>Ezhou, Hubei Province (Long-day environment)</h3>';
            ezhouHtml += '<table><tr><th>Trait</th><th>Estimated value</th></tr>';
            const ezhouKeys = allKeys.filter(key => key.startsWith('E'));
            for (const key of ezhouKeys) {
                ezhouHtml += `<tr><td>${displayKeyName(key)}</td><td>${result[key]}</td></tr>`;
            }
            ezhouHtml += '</table>';
            ezhouDiv.innerHTML = ezhouHtml;

            // Sanya 表格
            let sanyaHtml = '<h3>Sanya, Hainan Province (Short-day environment)</h3>';
            sanyaHtml += '<table><tr><th>Trait</th><th>Estimated value</th></tr>';
            const sanyaKeys = allKeys.filter(key => key.startsWith('S'));
            for (const key of sanyaKeys) {
                sanyaHtml += `<tr><td>${displayKeyName(key)}</td><td>${result[key]}</td></tr>`;
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