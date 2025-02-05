var lastSelected,
  bonusPoints = 0,
  totalAmount = 0,
  itemCount = 0;

const productList = [
  { id: "p1", name: "상품1", val: 10000, q: 50 },
  { id: "p2", name: "상품2", val: 20000, q: 30 },
  { id: "p3", name: "상품3", val: 30000, q: 20 },
  { id: "p4", name: "상품4", val: 15000, q: 0 },
  { id: "p5", name: "상품5", val: 25000, q: 10 },
];

const elements = {};

// 유틸리티 함수
const createElement = (tag, className = "", id = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (id) element.id = id;
  return element;
};

const createElementWithText = (tag, text, className = "", id = "") => {
  const element = createElement(tag, className, id);
  element.textContent = text;
  return element;
};

// 초기 UI 생성
const createUI = () => {
  const root = document.getElementById("app");
  const wrapper = createElement(
    "div",
    "max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8"
  );

  const container = createElement("div", "bg-gray-100 p-8");

  const title = createElementWithText(
    "h1",
    "장바구니",
    "text-2xl font-bold mb-4"
  );

  elements.cartDisplay = createElement("div", "", "cart-items");

  elements.cartTotal = createElement(
    "div",
    "text-xl font-bold my-4",
    "cart-total"
  );

  elements.productSelect = createElement(
    "select",
    "border rounded p-2 mr-2",
    "product-select"
  );

  elements.addBtn = createElementWithText(
    "button",
    "추가",
    "bg-blue-500 text-white px-4 py-2 rounded",
    "add-to-cart"
  );

  elements.stockInfo = createElement(
    "div",
    "text-sm text-gray-500 mt-2",
    "stock-status"
  );

  root.appendChild(container);
  wrapper.append(
    title,
    elements.cartDisplay,
    elements.cartTotal,
    elements.productSelect,
    elements.addBtn,
    elements.stockInfo
  );

  container.appendChild(wrapper);

  updateSelOpts();
  calcCart();
};

setTimeout(function () {
  setInterval(function () {
    var luckyItem = productList[Math.floor(Math.random() * productList.length)];
    if (Math.random() < 0.3 && luckyItem.q > 0) {
      luckyItem.val = Math.round(luckyItem.val * 0.8);
      alert("번개세일! " + luckyItem.name + "이(가) 20% 할인 중입니다!");
      updateSelOpts();
    }
  }, 30000);
}, Math.random() * 10000);

setTimeout(function () {
  setInterval(function () {
    if (lastSelected) {
      var suggest = productList.find(function (item) {
        return item.id !== lastSelected && item.q > 0;
      });
      if (suggest) {
        alert(suggest.name + "은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!");
        suggest.val = Math.round(suggest.val * 0.95);
        updateSelOpts();
      }
    }
  }, 60000);
}, Math.random() * 20000);

function updateSelOpts() {
  elements.productSelect.innerHTML = "";
  productList.forEach(function (item) {
    var opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = item.name + " - " + item.val + "원";
    if (item.q === 0) opt.disabled = true;
    elements.productSelect.appendChild(opt);
  });
}

function calcCart() {
  totalAmount = 0;
  itemCount = 0;
  var cartItems = elements.cartDisplay.children;
  var subTot = 0;
  for (var i = 0; i < cartItems.length; i++) {
    (function () {
      var curItem;
      for (var j = 0; j < productList.length; j++) {
        if (productList[j].id === cartItems[i].id) {
          curItem = productList[j];
          break;
        }
      }
      var q = parseInt(
        cartItems[i].querySelector("span").textContent.split("x ")[1]
      );
      var itemTot = curItem.val * q;
      var disc = 0;
      itemCount += q;
      subTot += itemTot;
      if (q >= 10) {
        if (curItem.id === "p1") disc = 0.1;
        else if (curItem.id === "p2") disc = 0.15;
        else if (curItem.id === "p3") disc = 0.2;
        else if (curItem.id === "p4") disc = 0.05;
        else if (curItem.id === "p5") disc = 0.25;
      }
      totalAmount += itemTot * (1 - disc);
    })();
  }
  let discRate = 0;
  if (itemCount >= 30) {
    var bulkDisc = totalAmount * 0.25;
    var itemDisc = subTot - totalAmount;
    if (bulkDisc > itemDisc) {
      totalAmount = subTot * (1 - 0.25);
      discRate = 0.25;
    } else {
      discRate = (subTot - totalAmount) / subTot;
    }
  } else {
    discRate = (subTot - totalAmount) / subTot;
  }
  if (new Date().getDay() === 2) {
    totalAmount *= 1 - 0.1;
    discRate = Math.max(discRate, 0.1);
  }

  elements.cartTotal.textContent = "총액: " + Math.round(totalAmount) + "원";
  if (discRate > 0) {
    var span = document.createElement("span");
    span.className = "text-green-500 ml-2";
    span.textContent = "(" + (discRate * 100).toFixed(1) + "% 할인 적용)";
    elements.cartTotal.appendChild(span);
  }
  updateStockInfo();
  renderbonusPoints();
}

const renderbonusPoints = () => {
  bonusPoints = Math.floor(totalAmount / 1000);
  var ptsTag = document.getElementById("loyalty-points");
  if (!ptsTag) {
    ptsTag = document.createElement("span");
    ptsTag.id = "loyalty-points";
    ptsTag.className = "text-blue-500 ml-2";
    elements.cartTotal.appendChild(ptsTag);
  }
  ptsTag.textContent = "(포인트: " + bonusPoints + ")";
};

function updateStockInfo() {
  var infoMsg = "";
  productList.forEach(function (item) {
    if (item.q < 5) {
      infoMsg +=
        item.name +
        ": " +
        (item.q > 0 ? "재고 부족 (" + item.q + "개 남음)" : "품절") +
        "\n";
    }
  });

  elements.stockInfo.textContent = infoMsg;
}

elements.addBtn.addEventListener("click", function () {
  var selItem = elements.productSelect.value;
  var itemToAdd = productList.find(function (p) {
    return p.id === selItem;
  });
  if (itemToAdd && itemToAdd.q > 0) {
    var item = document.getElementById(itemToAdd.id);
    if (item) {
      var newQty =
        parseInt(item.querySelector("span").textContent.split("x ")[1]) + 1;
      if (newQty <= itemToAdd.q) {
        item.querySelector("span").textContent =
          itemToAdd.name + " - " + itemToAdd.val + "원 x " + newQty;
        itemToAdd.q--;
      } else {
        alert("재고가 부족합니다.");
      }
    } else {
      var newItem = document.createElement("div");
      newItem.id = itemToAdd.id;
      newItem.className = "flex justify-between items-center mb-2";
      newItem.innerHTML =
        "<span>" +
        itemToAdd.name +
        " - " +
        itemToAdd.val +
        "원 x 1</span><div>" +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        itemToAdd.id +
        '" data-change="-1">-</button>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        itemToAdd.id +
        '" data-change="1">+</button>' +
        '<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="' +
        itemToAdd.id +
        '">삭제</button></div>';
      elements.cartDisplay.appendChild(newItem);
      itemToAdd.q--;
    }
    calcCart();
    lastSelected = selItem;
  }
});

elements.cartDisplay.addEventListener("click", function (event) {
  var tgt = event.target;
  if (
    tgt.classList.contains("quantity-change") ||
    tgt.classList.contains("remove-item")
  ) {
    var prodId = tgt.dataset.productId;
    var itemElem = document.getElementById(prodId);
    var prod = productList.find(function (p) {
      return p.id === prodId;
    });
    if (tgt.classList.contains("quantity-change")) {
      var qtyChange = parseInt(tgt.dataset.change);
      var newQty =
        parseInt(itemElem.querySelector("span").textContent.split("x ")[1]) +
        qtyChange;
      if (
        newQty > 0 &&
        newQty <=
          prod.q +
            parseInt(itemElem.querySelector("span").textContent.split("x ")[1])
      ) {
        itemElem.querySelector("span").textContent =
          itemElem.querySelector("span").textContent.split("x ")[0] +
          "x " +
          newQty;
        prod.q -= qtyChange;
      } else if (newQty <= 0) {
        itemElem.remove();
        prod.q -= qtyChange;
      } else {
        alert("재고가 부족합니다.");
      }
    } else if (tgt.classList.contains("remove-item")) {
      var remQty = parseInt(
        itemElem.querySelector("span").textContent.split("x ")[1]
      );
      prod.q += remQty;
      itemElem.remove();
    }
    calcCart();
  }
});

createUI();
