import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const integrationPath = process.cwd();
const configPath = path.resolve(integrationPath, `nango.yaml`);
const config: any = yaml.load(fs.readFileSync(configPath, 'utf8'));
const { integrations } = config;

for (const integration in integrations) {
    const { syncs } = integrations[integration];
    for (const syncName in syncs) {
        const sync = syncs[syncName];
        generateSyncTest(integration, syncName, sync.output);
    }
}

function generateSyncTest(integration: string, syncName: string, modelName: string) {
    const data: {
        integration: string;
        syncName: string;
        modelName: string;
    } = {
        integration,
        syncName,
        modelName
    };

    console.log(`Data: ${JSON.stringify(data, null, 2)}`);

    const templatePath = path.resolve(__dirname, 'sync-template.ejs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');

    const result = ejs.render(templateSource, data);

    if (!fs.existsSync(path.resolve(integrationPath, `${integration}/tests`))) {
        fs.mkdirSync(path.resolve(integrationPath, `${integration}/tests`), { recursive: true });
    }
    const outputPath = path.resolve(integrationPath, `${integration}/tests/${data['integration']}-${data['syncName']}.test.ts`);
    fs.writeFileSync(outputPath, result);

    console.log(`Test file 'tests/${data['integration']}-${data['syncName']}.test.ts' created successfully.`);
}
