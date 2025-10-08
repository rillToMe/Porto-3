const API = {
  async readAll(){ const r=await fetch('/api/admin?action=readAll'); return r.json(); },
  async read(col){ const r=await fetch(`/api/admin?action=read&collection=${col}`); return r.json(); },
  async upsert(collection, data){ 
    const r=await fetch('/api/admin', {method:'POST',headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'upsert', collection, data})});
    return r.json();
  },
  async del(collection, id){
    const r=await fetch('/api/admin', {method:'POST',headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'delete', collection, id})});
    return r.json();
  },
  async uploadBase64(filename, base64){
    const r=await fetch('/api/admin', {method:'POST',headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'uploadBase64', filename, base64})});
    return r.json();
  }
};

const gate = document.getElementById('gate');
const app  = document.getElementById('app');
const keyInput = document.getElementById('key');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const colSel = document.getElementById('collection');
const reloadBtn = document.getElementById('reload');
const newBtn = document.getElementById('new');
const listEl = document.getElementById('list');
const formEl = document.getElementById('form');

function ls(k,v){ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }
function toast(t){ alert(t); } // ganti pakai toastmu sendiri kalau mau

// Gating UI (client-side doang biar nyaman). Server tetap cek API KEY di proxy → GAS.
(function initGate(){
  if (ls('admin_ok')==='1') { gate.style.display='none'; app.style.display='block'; load(); }
  loginBtn.onclick = async()=>{
    if (!keyInput.value.trim()) return toast('Isi admin key');
    // probe: panggil readAll (akan gagal kalau key server salah, tapi client gating ini cuma UX)
    ls('admin_ok','1'); gate.style.display='none'; app.style.display='block'; load();
  };
  logoutBtn.onclick = ()=>{ localStorage.removeItem('admin_ok'); location.reload(); };
})();

async function load(){
  const col = colSel.value;
  formEl.style.display='none'; formEl.innerHTML='';
  listEl.innerHTML='Loading...';

  try {
    const r = await API.read(col);
    console.log('READ RESP:', r);            
    if (!r || r.status !== 'success') {
      listEl.innerHTML = `Gagal memuat.<br><small>${(r && (r.message||JSON.stringify(r))) || 'no response'}</small>`;
      return;
    }

    if (col==='profile') renderProfile(r.data);
    else renderTable(col, r.data);
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `Gagal memuat.<br><small>${err.message}</small>`;
  }
}


function renderProfile(d){
  const p = d[0] || {};
  listEl.innerHTML = `
    <div class="grid">
      <div><label>name</label><input id="p_name" value="${p.name||''}"></div>
      <div><label>title</label><input id="p_title" value="${p.title||''}"></div>
      <div style="grid-column:1/3"><label>bio</label><textarea id="p_bio" rows="4">${p.bio||''}</textarea></div>
      <div style="grid-column:1/3"><label>avatarUrl</label><input id="p_avatar" value="${p.avatarUrl||''}"></div>
      <div class="row"><input type="file" id="p_file"><button class="btn" id="p_upload">Upload Gambar</button></div>
      <div><button class="btn" id="p_save">Simpan</button></div>
    </div>
  `;
  document.getElementById('p_upload').onclick = async()=>{
    const f = document.getElementById('p_file').files[0];
    if(!f) return toast('Pilih file');
    const b64 = await fileToBase64(f);
    const up = await API.uploadBase64(`avatar_${Date.now()}.jpg`, b64.split(',')[1]);
    if (up.status==='success'){ document.getElementById('p_avatar').value = up.file.url; toast('Upload OK'); }
    else toast('Upload gagal');
  };
  document.getElementById('p_save').onclick = async()=>{
    const data = {
      id: 'profile', // kunci tetap
      name:  document.getElementById('p_name').value,
      title: document.getElementById('p_title').value,
      bio:   document.getElementById('p_bio').value,
      avatarUrl: document.getElementById('p_avatar').value
    };
    const r = await API.upsert('profile', data);
    toast(r.status==='success' ? 'Tersimpan' : 'Gagal simpan');
  };
}

function renderTable(col, items){
  const cols = Object.keys(items[0]||{id:'', title:''});
  const head = cols.map(h=>`<th>${h}</th>`).join('') + '<th>Aksi</th>';
  const rows = items.map(it=>{
    const tds = cols.map(c=>`<td>${safe(it[c])}</td>`).join('');
    return `<tr>${tds}<td>
      <button class="btn" onclick='edit("${col}", "${safe(it.id)}")'>Edit</button>
      <button class="danger" onclick='removeItem("${col}", "${safe(it.id)}")'>Hapus</button>
    </td></tr>`;
  }).join('');
  listEl.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

window.edit = (col, id)=>{
  formEl.style.display='block';
  formEl.innerHTML = `
    <div class="grid">
      <div><label>id</label><input id="f_id" value="${id}" disabled></div>
      <div><label>field</label><input id="f_field" placeholder="mis. title"></div>
      <div style="grid-column:1/3"><label>value</label><input id="f_value"></div>
      <div class="row">
        <input type="file" id="f_file"><button class="btn" id="f_upload">Upload → isi value</button>
      </div>
      <div><button class="btn" id="f_save">Simpan</button></div>
    </div>`;
  document.getElementById('f_upload').onclick = async()=>{
    const f = document.getElementById('f_file').files[0];
    if(!f) return toast('Pilih file');
    const b64 = await fileToBase64(f);
    const up = await API.uploadBase64(`${col}_${id}_${Date.now()}.jpg`, b64.split(',')[1]);
    if (up.status==='success'){ document.getElementById('f_value').value = up.file.url; toast('Upload OK'); }
    else toast('Upload gagal');
  };
  document.getElementById('f_save').onclick = async()=>{
    const field = document.getElementById('f_field').value.trim();
    const value = document.getElementById('f_value').value.trim();
    if(!field) return toast('Isi field');
    const r = await API.upsert(col, { id, [field]: value });
    toast(r.status==='success' ? 'Tersimpan' : 'Gagal simpan');
    load();
  };
};

window.removeItem = async(col,id)=>{
  if(!confirm('Hapus item?')) return;
  const r = await API.del(col, id);
  toast(r.status==='success' ? 'Terhapus' : 'Gagal hapus');
  load();
};

newBtn.onclick = ()=>{
  const col = colSel.value;
  formEl.style.display='block';
  formEl.innerHTML = `
    <div class="grid">
      <div><label>id</label><input id="n_id" placeholder="unik"></div>
      <div><label>title/platform</label><input id="n_title"></div>
      <div><label>url/thumb/pdf</label><input id="n_url"></div>
      <div><button class="btn" id="n_add">Tambah</button></div>
    </div>`;
  document.getElementById('n_add').onclick = async()=>{
    const id = document.getElementById('n_id').value.trim();
    const title = document.getElementById('n_title').value.trim();
    const url = document.getElementById('n_url').value.trim();
    if(!id) return toast('Isi id');
    // struktur fleksibel: minimal id + satu field penting
    const r = await API.upsert(col, { id, title, url });
    toast(r.status==='success' ? 'Tersimpan' : 'Gagal');
    load();
  };
};

reloadBtn.onclick = load;
colSel.onchange = load;

function safe(s){ return String(s??'').replaceAll('"','&quot;').replaceAll('<','&lt;'); }
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

