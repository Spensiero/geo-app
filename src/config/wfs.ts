type TWfsConfig = {
    id: string;
    label: string;
    typeName: string;
    wfsUrl: string;
    colorMap: Record<string, string>;
    legendItems: { color: string; label: string }[];
    featureType: string;
};

export const wfsConfig: TWfsConfig[] = [
    {
        id: 'luchtvaartgebieden',
        label: 'Flight Zones',
        typeName: 'drone-no-flyzones:luchtvaartgebieden',
        wfsUrl: '/lvnl/drone-no-flyzones/wfs/v1_0',
        colorMap: {
            'Beperkt toegestaan': 'rgba(0, 0, 255, 0.4)',
            'Verboden': 'rgba(255, 0, 0, 0.4)',
            'Natura2000': 'rgba(0, 255, 0, 0.4)',
        },
        legendItems: [
            { color: 'rgba(255, 0, 0, 0.7)', label: 'Forbidden' },
            { color: 'rgba(0, 0, 255, 0.7)', label: 'Limited Permission' },
            { color: 'rgba(0, 255, 0, 0.7)', label: 'Natura2000' },
        ],
        featureType: 'localtype'
    },
    {
        id: 'fysischgeografischeregios',
        label: 'Physical Geographical Regions',
        typeName: 'fysischgeografischeregios:fysischgeografischeregios',
        wfsUrl: '/ez/fysischgeografischeregios/wfs/v1_0',
        colorMap: {
            'Duinen': 'rgba(240,220,130,0.4)',
            'Getijdengebied': 'rgba(180,200,160,0.4)',
            'Hogere Zandgronden': 'rgba(210,180,140,0.4)',
            'Laagveengebied': 'rgba(130,80,50,0.4)',
            'Niet indeelbaar': 'rgba(200,200,200,0.4)',
            'Rivierengebied': 'rgba(100,160,90,0.4)',
            'Zeekleigebied': 'rgba(120,150,200,0.4)',
            'Afgesloten Zeearmen': 'rgba(120,150,200,0.4)',
            'Noordzee': 'rgba(60,100,160,0.4)'
        },
        legendItems: [
            { color: 'rgba(240,220,130,0.7)', label: 'Dunes' },
            { color: 'rgba(180,200,160,0.7)', label: 'Tidal Area' },
            { color: 'rgba(210,180,140,0.7)', label: 'Higher Sandy Grounds' },
            { color: 'rgba(130,80,50,0.7)', label: 'Peat Area' },
            { color: 'rgba(200,200,200,0.7)', label: 'Not Classifiable' },
            { color: 'rgba(100,160,90,0.7)', label: 'River Area' },
            { color: 'rgba(120,150,200,0.7)', label: 'Marine Clay Area' },
            { color: 'rgba(120,150,200,0.7)', label: 'Enclosed Sea Arms' },
            { color: 'rgba(60,100,160,0.7)', label: 'North Sea' }
        ],
        featureType: 'fgr'
    }
];