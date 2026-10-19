const orders = [
  {id:'ADH000190', customer:'Lê Nga (HH)', carrier:'bookship', carrierLabel:'Gửi xe', products:3, picked:'10:12 20-07', picker:'Hiệp', lateDays:91, state:'waiting', owner:null, photos:0, boxes:null, group:'Chưa ai đóng · đơn bookship', price:'7.345.000đ', tracking:'BS89300190'},
  {id:'ADH004199', customer:'Janry (CA)', carrier:'bookship', carrierLabel:'Gửi xe', products:1, picked:'16:44 26-08', picker:'Trà My', lateDays:0, state:'other', owner:'Huỳnh Đức', photos:1, boxes:null, group:'Người khác đang đóng', price:'2.256.000đ', tracking:'BS89304199'},
  {id:'ADH010338', customer:'Thái Ngân (HH)', carrier:'ghtk', carrierLabel:'GHTK', products:6, picked:'16:08 01-10', picker:'Trang', lateDays:0, state:'mine', owner:'Bạn', photos:3, boxes:0, group:'Bạn đang đóng · đơn thường', price:'5.890.000đ', tracking:'GHTK010338'},
  {id:'ADH004420', customer:'Bích Hồng Pkt (HX)', carrier:'bookship', carrierLabel:'Gửi xe', products:2, picked:'09:13 28-09', picker:'Trường Văn Hiệp', lateDays:0, state:'waiting', owner:null, photos:1, boxes:null, group:'Chưa ai đóng · đơn bookship', price:'12.930.000đ', tracking:'BS89304420'},
  {id:'ADH009251', customer:'Minh Anh Store', carrier:'ghtk', carrierLabel:'GHTK', products:4, picked:'14:20 16-10', picker:'Lan Trần', lateDays:0, state:'other', owner:'Lan Trần', photos:2, boxes:1, group:'Người khác đang đóng', price:'1.480.000đ', tracking:'GHTK009251'},
  {id:'ADH003615', customer:'Shop Mây Nhỏ', carrier:'spx', carrierLabel:'SPX', products:2, picked:'11:05 17-10', picker:'Hiệp', lateDays:0, state:'waiting', owner:null, photos:0, boxes:0, group:'Chưa ai đóng · đơn thường', price:'890.000đ', tracking:'SPX003615'},
  {id:'ADH008771', customer:'Hồng Nhung', carrier:'vtp', carrierLabel:'VTP', products:5, picked:'08:35 18-10', picker:'Trang', lateDays:0, state:'waiting', owner:null, photos:2, boxes:0, group:'Chưa ai đóng · đơn thường', price:'3.120.000đ', tracking:'VTP008771'},
  {id:'ADH002140', customer:'Mộc Nhiên', carrier:'bookship', carrierLabel:'Gửi xe', products:2, picked:'13:10 18-10', picker:'Trà My', lateDays:0, state:'waiting', owner:null, photos:1, boxes:null, group:'Chưa ai đóng · đơn bookship', price:'1.250.000đ', tracking:'BS89302140'},
  {id:'ADH006508', customer:'Bảo Châu', carrier:'bookship', carrierLabel:'Gửi xe', products:1, picked:'09:40 19-10', picker:'Hiệp', lateDays:0, state:'done', owner:'Bạn', photos:1, boxes:null, group:'Xong hôm nay', price:'620.000đ', tracking:'BS89306508'},
  {id:'ADH007321', customer:'Tiệm Nhà Gạo', carrier:'ghtk', carrierLabel:'GHTK', products:3, picked:'10:22 19-10', picker:'Lan Trần', lateDays:0, state:'done', owner:'Lan Trần', photos:3, boxes:1, group:'Xong hôm nay', price:'2.040.000đ', tracking:'GHTK007321'}
];

let activeStatus = 'waiting';
let activeCarrier = 'all';
let activeOrderId = null;
const orderList = document.querySelector('#order-list');
const searchInput = document.querySelector('#search-input');
const emptyState = document.querySelector('#empty-state');
const resultCount = document.querySelector('#result-count');
const toast = document.querySelector('#toast');
const dialog = document.querySelector('#order-dialog');

const carrierClass = key => ({bookship:'bookship',ghtk:'ghtk',spx:'spx',vtp:'vtp'}[key] || 'bookship');
function actionFor(order){
  if(order.state === 'mine') return {label:'Tiếp tục', primary:true, action:'continue'};
  if(order.state === 'other') return {label:'Cùng đóng', primary:false, action:'join'};
  return {label:'Bắt đầu đóng', primary:true, action:'start'};
}
function progressMarkup(order){
  const bits = [];
  if(order.owner && order.state !== 'done'){
    bits.push(`<span class="progress-chip working"><span class="tiny-icon">♙</span>${order.owner === 'Bạn' ? 'Bạn đang đóng' : `${escapeHtml(order.owner)} đang đóng`}</span>`);
  } else {
    bits.push(`<span class="progress-chip photo"><span class="tiny-icon">▧</span>Ảnh hàng ${order.photos}</span>`);
  }
  if(order.carrier !== 'bookship'){
    const missing = Number(order.boxes || 0) === 0;
    bits.push(`<span class="progress-chip ${missing ? 'missing' : 'warning'}"><span class="tiny-icon">⬡</span>Ảnh thùng ${order.boxes ?? 0}</span>`);
  }
  return bits.join('');
}
function cardMarkup(order){
  const action = actionFor(order);
  return `<article class="order-card" tabindex="0" role="button" data-open="${order.id}" aria-label="Mở chi tiết đơn ${order.id}">
    <div class="order-top">
      <div class="identity"><span class="order-id">${order.id}</span><span class="customer" title="${escapeHtml(order.customer)}">${escapeHtml(order.customer)}</span></div>
      <span class="carrier ${carrierClass(order.carrier)}">${order.carrierLabel}</span>
    </div>
    <div class="order-meta"><strong class="product-count">${order.products} SP</strong><span class="picked-meta">Nhặt ${order.picked} · ${escapeHtml(order.picker)}</span>${order.lateDays > 0 ? `<span class="late-badge">Trễ ${order.lateDays} ngày</span>` : ''}</div>
    <div class="order-divider"></div>
    <div class="order-bottom"><div class="progress-chips">${progressMarkup(order)}</div><button class="action-btn ${action.primary ? 'primary' : 'secondary'}" data-action="${action.action}" data-id="${order.id}">${action.label}</button></div>
  </article>`;
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function visibleOrders(){
  const q = searchInput.value.trim().toLocaleLowerCase('vi');
  return orders.filter(order => {
    const statusMatch = activeStatus === 'waiting' ? order.state !== 'done' : activeStatus === 'done' ? order.state === 'done' : order.state === 'mine';
    const carrierMatch = activeCarrier === 'all' || order.carrier === activeCarrier;
    const textMatch = !q || [order.id, order.customer, order.tracking, order.picker, order.carrierLabel].join(' ').toLocaleLowerCase('vi').includes(q);
    return statusMatch && carrierMatch && textMatch;
  }).sort((a,b) => (b.lateDays > 0) - (a.lateDays > 0) || (b.lateDays - a.lateDays));
}
function render(){
  const list = visibleOrders();
  orderList.innerHTML = list.map(cardMarkup).join('');
  emptyState.classList.toggle('hidden', list.length > 0);
  orderList.classList.toggle('hidden', list.length === 0);
  resultCount.textContent = `${list.length} đơn hiển thị`;
  const headings = {waiting:'Đơn cần xử lý',done:'Đơn đã hoàn thành hôm nay',mine:'Đơn bạn đang đóng'};
  document.querySelector('#list-title').textContent = activeStatus === 'waiting' ? 'Danh sách đơn đóng' : headings[activeStatus];
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.status === activeStatus));
  document.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('selected', chip.dataset.carrier === activeCarrier));
}
function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}
function openOrder(id){
  const order = orders.find(item => item.id === id);
  if(!order) return;
  activeOrderId = id;
  const action = actionFor(order);
  document.querySelector('#dialog-title').textContent = order.id;
  document.querySelector('#dialog-content').innerHTML = `
    <div class="order-top"><div class="identity"><strong>${escapeHtml(order.customer)}</strong></div><span class="carrier ${carrierClass(order.carrier)}">${order.carrierLabel}</span></div>
    <div class="detail-grid">
      <div class="detail-item"><span>Số lượng sản phẩm</span><strong>${order.products} SP</strong></div>
      <div class="detail-item"><span>Mã vận đơn</span><strong>${order.tracking}</strong></div>
      <div class="detail-item"><span>Thời gian nhặt</span><strong>${order.picked}</strong></div>
      <div class="detail-item"><span>Người nhặt</span><strong>${escapeHtml(order.picker)}</strong></div>
      <div class="detail-item"><span>Giá trị đơn</span><strong>${order.price}</strong></div>
      <div class="detail-item"><span>Ảnh hàng / ảnh thùng</span><strong>${order.photos} / ${order.boxes === null ? 'Không áp dụng' : order.boxes}</strong></div>
    </div>
    <p class="detail-note">${order.lateDays ? `Đơn đã trễ ${order.lateDays} ngày theo dữ liệu demo. ` : ''}${order.owner ? `Trạng thái hiện tại: ${order.owner === 'Bạn' ? 'bạn đang đóng' : escapeHtml(order.owner) + ' đang đóng'}.` : 'Chưa có nhân viên bắt đầu đóng đơn.'} Đây là giao diện demo; thao tác chỉ cập nhật dữ liệu trên trang hiện tại.</p>`;
  const primary = document.querySelector('#dialog-primary');
  primary.textContent = action.label;
  primary.dataset.action = action.action;
  dialog.showModal();
}
function handleAction(action, id){
  const order = orders.find(item => item.id === id);
  if(!order) return;
  if(action === 'start' || action === 'continue'){
    order.state = 'mine'; order.owner = 'Bạn';
    showToast(action === 'start' ? `Đã bắt đầu đóng ${id}` : `Tiếp tục đóng ${id}`);
  } else if(action === 'join'){
    order.state = 'mine'; order.owner = 'Bạn';
    showToast(`Bạn đã tham gia đóng ${id}`);
  }
  dialog.close();
  render();
  openOrder(id);
}
orderList.addEventListener('click', event => {
  const actionButton = event.target.closest('[data-action]');
  if(actionButton){event.stopPropagation();handleAction(actionButton.dataset.action, actionButton.dataset.id);return;}
  const card = event.target.closest('[data-open]');
  if(card) openOrder(card.dataset.open);
});
orderList.addEventListener('keydown', event => {
  if((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-open]')){event.preventDefault();openOrder(event.target.dataset.open);}
});
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {activeStatus = tab.dataset.status;render();}));
document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {activeCarrier = chip.dataset.carrier;render();}));
searchInput.addEventListener('input', render);
document.querySelector('#clear-filters').addEventListener('click', () => {searchInput.value='';activeCarrier='all';activeStatus='waiting';render();});
document.querySelector('#refresh-btn').addEventListener('click', () => {render();showToast('Danh sách đã được làm mới');});
document.querySelector('#view-alerts').addEventListener('click', () => showToast('26 đơn đã hủy: đây là dữ liệu minh họa.'));
document.querySelector('#notifications').addEventListener('click', () => showToast('Bạn không có thông báo mới.'));
document.querySelector('#profile').addEventListener('click', () => showToast('Tài khoản nhân viên: Hiệp.'));
document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.toggle('active', nav === item));
  const page = item.dataset.page;
  if(page !== 'Kho vận') showToast(`Mục “${page}” là trang minh họa trong bản clone.`);
  else showToast('Bạn đang ở mục Kho vận.');
}));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#back-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#dialog-primary').addEventListener('click', event => {
  if(activeOrderId) handleAction(event.currentTarget.dataset.action, activeOrderId);
});
dialog.addEventListener('click', event => {if(event.target === dialog) dialog.close();});
render();
