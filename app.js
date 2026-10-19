(() => {
  const $ = (id) => document.getElementById(id);
  const teams = [1,2,3,4];
  const connection = $("connection");
  const scoreboard = $("scoreboard");
  const historyEl = $("history");
  const formMessage = $("formMessage");
  const qrPanel = $("qrPanel");
  let db = null, entries = [], scores = {1:0,2:0,3:0,4:0};
  let localMode = false;
  const cfg = window.FIREBASE_CONFIG || {};
  const configured = cfg.apiKey && !cfg.apiKey.startsWith("YOUR_") &&
    cfg.projectId && !cfg.projectId.startsWith("YOUR_") &&
    cfg.databaseURL && !cfg.databaseURL.includes("YOUR_");

  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const timeText = (n) => {
    try { return new Date(n).toLocaleString("vi-VN", {dateStyle:"short",timeStyle:"short"}); }
    catch { return new Date(n).toLocaleString(); }
  };
  function setStatus(text, cls="") { connection.textContent=text; connection.className="status "+cls; }
  function calcScores() {
    scores={1:0,2:0,3:0,4:0};
    entries.forEach(e => { if (scores[e.team] !== undefined) scores[e.team] += Number(e.delta)||0; });
  }
  function renderScores() {
    const sorted=teams.map(team=>({team,score:scores[team]})).sort((a,b)=>b.score-a.score || a.team-b.team);
    scoreboard.innerHTML=sorted.map((x,i)=>`<article class="score-card ${i===0?'winner':''}">
      <span class="rank">HẠNG ${i+1}</span><span class="rank-badge">${i===0?'🏆':i===1?'🥈':i===2?'🥉':'⭐'}</span>
      <div class="team-name">Tổ ${x.team}</div><div class="score">${x.score} <small>điểm</small></div>
    </article>`).join("");
  }
  function renderHistory() {
    if(!entries.length){historyEl.innerHTML='<div class="empty">Chưa có lượt chấm điểm nào. Hãy ghi nhận điểm đầu tiên nhé.</div>';return;}
    historyEl.innerHTML=entries.slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,100).map(e=>`
      <article class="history-item"><div><div class="history-title">Tổ ${e.team} · ${e.delta>0?'Cộng điểm':'Trừ điểm'}</div>
      <div class="history-reason">${esc(e.reason||'Không có lý do')}</div><div class="history-time">${timeText(e.createdAt||Date.now())}</div></div>
      <div class="delta ${e.delta>0?'plus':'minus'}">${e.delta>0?'+':''}${e.delta}</div></article>`).join("");
  }
  function render(){calcScores();renderScores();renderHistory();}
  function showSetupError() {
    setStatus("Chưa kết nối dữ liệu","bad");
    historyEl.innerHTML='<div class="empty">Website chưa được nối với Firebase. Hãy làm theo file HUONG-DAN.md, điền cấu hình vào firebase-config.js rồi tải lại trang.</div>';
    formMessage.textContent="Cần cấu hình Firebase trước khi chấm điểm để dữ liệu có thể đồng bộ giữa các điện thoại.";
    $("submitBtn").disabled=true; $("submitBtn").style.opacity=".55";
  }
  if(configured && window.firebase) {
    try {
      firebase.initializeApp(cfg);
      db=firebase.database();
      setStatus("Đang kết nối…");
      db.ref(".info/connected").on("value", snap => setStatus(snap.val()?"Đã đồng bộ trực tuyến":"Đang mất kết nối",snap.val()?"ok":"bad"));
      db.ref("classScores/entries").on("value", snap => {
        const val=snap.val()||{};
        entries=Object.keys(val).map(k=>({...val[k],id:k}));
        render();
      }, err => {setStatus("Lỗi quyền truy cập","bad");formMessage.textContent="Firebase từ chối truy cập. Kiểm tra Realtime Database Rules trong file hướng dẫn.";});
    } catch(e) { showSetupError(); }
  } else {
    showSetupError();
  }
  $("scoreForm").addEventListener("submit", async e => {
    e.preventDefault();
    if(!db){formMessage.textContent="Chưa kết nối Firebase nên chưa thể lưu điểm.";return;}
    const team=Number($("team").value), amount=Number($("points").value), reason=$("reason").value.trim();
    const kind=document.querySelector('input[name="kind"]:checked').value;
    if(!Number.isInteger(amount)||amount<1||amount>100||!reason){formMessage.textContent="Nhập số điểm từ 1 đến 100 và lý do cụ thể.";return;}
    const delta=kind==="add"?amount:-amount;
    const btn=$("submitBtn");btn.disabled=true;btn.textContent="Đang lưu…";
    try {
      await db.ref("classScores/entries").push({team,delta,reason,createdAt:Date.now()});
      $("reason").value="";$("points").value="1";formMessage.textContent="Đã ghi nhận điểm và cập nhật bảng xếp hạng.";
    } catch(err) {formMessage.textContent="Không lưu được. Kiểm tra kết nối và quyền Firebase."; }
    finally {btn.disabled=false;btn.textContent="Ghi nhận điểm";}
  });
  $("shareBtn").addEventListener("click", () => {
    qrPanel.classList.remove("hidden");
    $("pageUrl").textContent=location.href;
    $("qrcode").innerHTML="";
    if(window.QRCode && location.protocol!=="file:") new QRCode($("qrcode"),{text:location.href,width:220,height:220,colorDark:"#173d32",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H});
    else $("qrcode").innerHTML='<p class="muted">Hãy mở website qua đường link HTTPS sau khi đăng tải để tạo mã QR.</p>';
    qrPanel.scrollIntoView({behavior:"smooth",block:"center"});
  });
  $("closeQr").addEventListener("click",()=>qrPanel.classList.add("hidden"));
  $("refreshBtn").addEventListener("click",()=>{render();formMessage.textContent="Đã làm mới dữ liệu đang hiển thị.";});
  $("downloadQr").addEventListener("click",()=>{
    const canvas=$("qrcode").querySelector("canvas");
    const img=$("qrcode").querySelector("img");
    const url=canvas?canvas.toDataURL("image/png"):(img?img.src:null);
    if(!url){alert("Chưa có mã QR. Hãy đăng tải website và mở bằng đường link HTTPS trước.");return;}
    const a=document.createElement("a");a.href=url;a.download="ma-qr-bang-diem-thi-dua.png";a.click();
  });
})();
