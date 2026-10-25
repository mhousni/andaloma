(function(){
 const root=document.getElementById('anda-real-map');
 if(!root || root.dataset.init) return;
 root.dataset.init='1';

 const regions=[
  {id:'tanger',name:'Tanger-Tétouan-Al Hoceïma',match:['tanger','tetouan','hoceima'],
   desc:'Territoire du nord du Royaume présentant un potentiel aquacole en cours d’étude.',
   status:'Potentiel en cours de finalisation',area:'À finaliser',plots:'À préciser',
   sectors:['Potentiel en cours de finalisation'],
   infra:['Données relatives aux infrastructures maritimes à compléter.'],
   advantages:'Le potentiel aquacole de la région est en cours de finalisation. Les informations seront actualisées après validation des données régionales.'},

  {id:'oriental',name:'L’Oriental',match:['oriental'],
   desc:'Territoire littoral méditerranéen.',
   status:'Informations régionales à compléter',area:'À renseigner',plots:'À renseigner',
   sectors:['À préciser'],infra:['Infrastructures maritimes régionales à renseigner.'],
   advantages:'Les informations relatives au potentiel et aux atouts aquacoles seront intégrées après consolidation des données.'},

  {id:'rabat',name:'Rabat-Salé-Kénitra',match:['rabat','sale','kenitra'],
   desc:'Territoire du littoral atlantique.',
   status:'Informations régionales à compléter',area:'À renseigner',plots:'À renseigner',
   sectors:['À préciser'],infra:['Infrastructures maritimes régionales à renseigner.'],
   advantages:'Les caractéristiques du territoire et ses opportunités aquacoles seront précisées sur la base des données régionales validées.'},

  {id:'casa',name:'Casablanca-Settat',match:['casablanca','settat'],
   desc:'Territoire atlantique à présenter à l’échelle régionale.',
   status:'Informations régionales à compléter',area:'À renseigner',plots:'À renseigner',
   sectors:['À préciser'],infra:['Infrastructures maritimes régionales à renseigner.'],
   advantages:'Les informations relatives aux potentialités aquacoles et aux infrastructures seront complétées après validation.'},

  {id:'marrakech',name:'Marrakech-Safi',match:['marrakech','safi'],
   desc:'Territoire côtier de la région Marrakech-Safi.',
   status:'Informations régionales à compléter',area:'À renseigner',plots:'À renseigner',
   sectors:['À préciser'],infra:['Infrastructures maritimes régionales à renseigner.'],
   advantages:'Les potentialités du littoral régional et les filières concernées seront détaillées à partir des données consolidées.'},

  {id:'souss',name:'Souss-Massa',match:['souss','massa'],
   desc:'Région à fort potentiel pour le développement de l’aquaculture marine.',
   status:'Potentiel aquacole identifié',area:'+3 900 ha',plots:'+250',
   sectors:['Pisciculture','Conchyliculture'],
   infra:['Port : Agadir','VDP : Imessouane','PDA : Imi Ouaddar, Tifnit, Aglou, Sidi Boulfdail, Goun...'],
   advantages:'Un littoral favorable au développement de l’aquaculture, avec des infrastructures maritimes et des filières potentielles diversifiées.'},

  {id:'guelmim',name:'Guelmim-Oued Noun',match:['guelmim','oued noun'],
   desc:'Territoire du sud atlantique.',
   status:'Informations régionales à compléter',area:'À renseigner',plots:'À renseigner',
   sectors:['À préciser'],infra:['Infrastructures maritimes régionales à renseigner.'],
   advantages:'Le potentiel aquacole régional et les atouts du territoire seront précisés après consolidation des informations.'},

  {id:'laayoune',name:'Laâyoune-Sakia El Hamra',match:['laayoune','laayoun','sakia'],
   desc:'Territoire du littoral sud-atlantique.',
   status:'Informations régionales à compléter',area:'À renseigner',plots:'À renseigner',
   sectors:['À préciser'],infra:['Infrastructures maritimes régionales à renseigner.'],
   advantages:'Les données relatives aux potentialités aquacoles, aux filières et aux infrastructures seront intégrées après validation.'},

  {id:'dakhla',name:'Dakhla-Oued Eddahab',match:['dakhla','oued eddahab'],
   desc:'Territoire littoral du sud du Royaume.',
   status:'Informations régionales à compléter',area:'À renseigner',plots:'À renseigner',
   sectors:['À préciser'],infra:['Infrastructures maritimes régionales à renseigner.'],
   advantages:'Les informations détaillées sur le potentiel, les filières et les infrastructures seront ajoutées à partir des données régionales validées.'}
 ];

 const $=id=>root.querySelector('#'+id);
 let map,geoLayer,selected='souss',featureById={};

 function norm(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 }

 function matchRegion(props){
  const values=Object.values(props||{}).filter(v=>typeof v==='string');
  const all=norm(values.join(' '));
  return regions.find(r=>r.match.some(m=>all.includes(norm(m))));
 }

 function showRegion(id,zoom){
  const r=regions.find(x=>x.id===id);
  if(!r)return;
  selected=id;
  $('anda-r-name').textContent=r.name;
  $('anda-r-description').textContent=r.desc;
  $('anda-r-status').textContent='● '+r.status;
  $('anda-r-area').textContent=r.area;
  $('anda-r-plots').textContent=r.plots;
  $('anda-r-advantages').textContent=r.advantages;

  const tags=$('anda-r-sectors');
  tags.replaceChildren();
  r.sectors.forEach(s=>{
   const el=document.createElement('span');
   el.className='tag';el.textContent=s;tags.appendChild(el);
  });

  const list=$('anda-r-infra');
  list.replaceChildren();
  r.infra.forEach(s=>{
   const li=document.createElement('li');li.textContent=s;list.appendChild(li);
  });

  root.querySelectorAll('.region-buttons button').forEach(b=>{
   b.classList.toggle('active',b.dataset.region===id);
  });

  if(geoLayer){
   geoLayer.eachLayer(layer=>{
    const active=layer.feature && matchRegion(layer.feature.properties)?.id===id;
    layer.setStyle({
     fillColor:active?'#8A9D8A':'#DCE7D9',
     fillOpacity:active?.85:.55,
     color:active?'#435B49':'#8A9D8A',
     weight:active?3:1.2
    });
    if(active && zoom) map.fitBounds(layer.getBounds(),{padding:[35,35],maxZoom:7});
   });
  }
 }

 function initButtons(){
  const box=$('anda-region-buttons');
  regions.forEach(r=>{
   const b=document.createElement('button');
   b.type='button';b.dataset.region=r.id;b.textContent=r.name;
   b.addEventListener('click',()=>{
    showRegion(r.id,true);
    if(window.innerWidth<850){
     $('anda-r-name').scrollIntoView({behavior:'smooth',block:'start'});
    }
   });
   box.appendChild(b);
  });
 }

 function loadMap(){
  const leafletCss=document.createElement('link');
  leafletCss.rel='stylesheet';
  leafletCss.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(leafletCss);

  const script=document.createElement('script');
  script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload=()=>{
   map=L.map($('anda-leaflet-map'),{scrollWheelZoom:false})
    .setView([29.5,-9.5],5);

   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap contributors',
    maxZoom:10
   }).addTo(map);

   fetch('https://communes.pages.dev/data/v1/geometry/regions.geojson')
    .then(res=>{
     if(!res.ok)throw new Error('GeoJSON indisponible');
     return res.json();
    })
    .then(data=>{
     geoLayer=L.geoJSON(data,{
      filter:feature=>!!matchRegion(feature.properties),
      style:feature=>({
       fillColor:'#DCE7D9',fillOpacity:.65,
       color:'#8A9D8A',weight:1.2
      }),
      onEachFeature:(feature,layer)=>{
       const r=matchRegion(feature.properties);
       if(!r)return;
       featureById[r.id]=layer;
       layer.bindTooltip(r.name,{sticky:true});
       layer.on('click',()=>showRegion(r.id,false));
      }
     }).addTo(map);

     if(geoLayer.getLayers().length){
      map.fitBounds(geoLayer.getBounds(),{padding:[20,20]});
      showRegion('souss',false);
     }else{
      $('anda-leaflet-map').innerHTML=
       '<div class="loading">Les limites régionales n’ont pas pu être identifiées dans le fichier GeoJSON.</div>';
     }
     setTimeout(()=>map.invalidateSize(),300);
    })
    .catch(()=>{
     $('anda-leaflet-map').innerHTML=
      '<div class="loading">Impossible de charger les limites géographiques. Vérifiez la connexion ou la disponibilité de la source GeoJSON.</div>';
    });
  };
  script.onerror=()=>{
   $('anda-leaflet-map').innerHTML=
    '<div class="loading">La bibliothèque cartographique n’a pas pu être chargée.</div>';
  };
  document.head.appendChild(script);
 }

 initButtons();
 showRegion('souss',false);
 loadMap();
})();