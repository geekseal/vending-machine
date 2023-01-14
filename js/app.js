import addComma from "./util/addComma.mjs";
import deleteComma from "./util/deleteComma.mjs";

const $vendingMachine = document.querySelector(".vending-machine");
const $listItem = $vendingMachine.querySelector(".list-item");
const $myInfo = document.querySelector(".my-info");
const $myMoney = document.querySelector(".txt-mymoney");
const $btnInsert = $vendingMachine.querySelector(".btn-insert");
const $balance = $vendingMachine.querySelector(".txt-balance");
const $inpInsert = $vendingMachine.querySelector("#inpInsert");
const $btnReturn = $vendingMachine.querySelector(".btn-return");
const $btnGet = $vendingMachine.querySelector(".btn-get");

class Builder {
  constructor() {
    this.balance = 0;
  }

  async setup() {
    await this.loadData(json => {
      this.displayItem(json);
    });

    $btnInsert.addEventListener("moneyinserted", e => {
      this.takeMoney(e);
    });
    // dispatchEvent 메서드는 이벤트 핸들러를 동기 처리 방식으로 처리한다. 따라서 dispatch 전에 이벤트 핸들러가 등록되어있어야 한다. 여기서는 만족한다.
    $btnReturn.addEventListener("click", this.returnMoney.bind(this));
    $btnGet.addEventListener("click", this.spitItem.bind(this));
  }

  async loadData(callback) {
    const res = await fetch("data/drinks.json");
    if (res.ok) {
      callback(await res.json());
    } else {
      alert("통신 에러!" + res.status);
    }
  }

  displayItem(data) {
    const frag = document.createDocumentFragment();
    data.forEach(item => {
      const li = document.createElement("li");

      const btnItem = document.createElement("button");
      btnItem.classList.add("btn-item");
      btnItem.setAttribute("type", "button");
      btnItem.setAttribute("data-name", item.name);
      btnItem.setAttribute("data-stock", item.stock);
      btnItem.setAttribute("data-price", item.price);
      btnItem.setAttribute("data-img", item.img);
      btnItem.onclick = this.handleItemBtn.bind(this);

      const imgItem = document.createElement("img");
      imgItem.classList.add("img-item");
      imgItem.setAttribute("src", `img/${item.img}`);
      imgItem.setAttribute("alt", "");

      const itemName = document.createElement("strong");
      itemName.classList.add("txt-item-name");
      itemName.textContent = item.name;

      const itemPrice = document.createElement("span");
      itemPrice.classList.add("txt-item-price");
      itemPrice.textContent = `${item.price}원`;

      [imgItem, itemName, itemPrice].forEach(v => {
        btnItem.appendChild(v);
      });
      li.appendChild(btnItem);
      frag.appendChild(li);
    });
    $listItem.appendChild(frag);
  }

  updateBalance() {
    $balance.textContent = `${addComma(this.balance)} 원`;
  }

  takeMoney(event) {
    // 문제 발생! 클래스를 두 개로 나누다보니 버튼에 달린 이벤트 실행 순서가 뒤죽박죽이어서 제대로 동작하지 않는 문제 발생. 또한 예외처리를 두 클래스에서 모두 해줘야한다는 단점도 있음. 따라서 조금 더 상호작용하는 것처럼 동작하기 위해 사용자가 돈을 성공적으로 입금한 후(== 즉 소지금의 변화가 생길 경우, 혹은 유니크한 사용자 정의 이벤트) 자판기의 이벤트를 발생시키도록 수정하겠음.
    console.log(event.detail.amount);
    this.balance += parseInt(event.detail.amount);
    this.updateBalance();
    $inpInsert.value = null;
  }

  returnMoney() {
    const spitMoney = new CustomEvent("moneyspit", {
      detail: { amount: this.balance },
    });
    $btnReturn.dispatchEvent(spitMoney);
    this.balance = 0;
    this.updateBalance();
  }

  handleItemBtn(e) {
    const clickedItemData = e.currentTarget.dataset;
    let isStaged = e.currentTarget.classList.contains("selected");
    const $listItemStaged = $vendingMachine.querySelector(".list-item-staged");
    const stagedListItem = $listItemStaged.querySelectorAll("button");

    if (parseInt(clickedItemData.price) > this.balance) {
      alert("잔액이 부족합니다.");
      return;
    }

    this.balance -= parseInt(clickedItemData.price);
    this.updateBalance();

    if (!isStaged) {
      this.displayStagedItem(clickedItemData);
      e.currentTarget.classList.add("selected");
      isStaged = true;
    } else {
      for (const item of stagedListItem) {
        if (item.dataset.name === clickedItemData.name) {
          item.querySelector(".num-counter").textContent++;
          break;
        }
      }
    }

    clickedItemData.stock--;

    if (parseInt(clickedItemData.stock) === 0) {
      e.currentTarget.classList.add("sold-out");
      const warning = document.createElement("em");
      warning.textContent = "해당 상품은 품절입니다.";
      warning.classList.add("ir");
      e.currentTarget.parentElement.insertBefore(warning, e.currentTarget);
    }
  }

  displayStagedItem(clickedItemData) {
    const $listItemStaged = $vendingMachine.querySelector(".list-item-staged");

    const li = document.createElement("li");

    const btnStagedItem = document.createElement("button");
    btnStagedItem.classList.add("btn-staged");
    btnStagedItem.setAttribute("data-name", clickedItemData.name);
    btnStagedItem.setAttribute("data-price", clickedItemData.price);
    btnStagedItem.setAttribute("data-img", clickedItemData.img);
    btnStagedItem.onclick = this.handleStagedItemBtn.bind(this);

    const imgStagedItem = document.createElement("img");
    imgStagedItem.classList.add("img-item");
    imgStagedItem.setAttribute("src", `img/${clickedItemData.img}`);
    imgStagedItem.setAttribute("alt", "");

    const txtStagedItemName = document.createElement("strong");
    txtStagedItemName.classList.add("txt-item");
    txtStagedItemName.textContent = clickedItemData.name;

    const txtStagedItemCounter = document.createElement("span");
    txtStagedItemCounter.classList.add("num-counter");
    txtStagedItemCounter.textContent = 1;

    [imgStagedItem, txtStagedItemName, txtStagedItemCounter].forEach(v => {
      btnStagedItem.appendChild(v);
    });
    li.appendChild(btnStagedItem);
    $listItemStaged.appendChild(li);
  }

  handleStagedItemBtn(e) {
    const $listItemStaged = $vendingMachine.querySelector(".list-item-staged");
    const displayedItemList = $vendingMachine.querySelector("#displayedItemList");
    const displayedItemBtns = displayedItemList.querySelectorAll("button");

    e.currentTarget.querySelector(".num-counter").textContent--;
    this.balance += parseInt(e.currentTarget.dataset.price);
    this.updateBalance();

    if (e.currentTarget.querySelector(".num-counter").textContent === "0") {
      $listItemStaged.removeChild(e.currentTarget.parentElement);
      for (const item of displayedItemBtns) {
        if (item.dataset.name === e.currentTarget.dataset.name) {
          item.classList.remove("selected");
          break;
        }
      }
    }

    for (const item of displayedItemBtns) {
      if (item.dataset.name === e.currentTarget.dataset.name) {
        item.dataset.stock++;
        item.classList.remove("sold-out");
        break;
      }
    }
  }

  spitItem() {
    const $listItemStaged = $vendingMachine.querySelector(".list-item-staged");
    const listItemBtns = $listItem.querySelectorAll("button");

    if ($listItemStaged.hasChildNodes()) {
      const stagedItemData = [...$listItemStaged.querySelectorAll("button")].map(v => {
        const count = parseInt(v.querySelector(".num-counter").textContent);
        return { ...v.dataset, count };
      });

      const itemSpit = new CustomEvent("itemspit", {
        detail: { payload: stagedItemData },
      });
      $btnGet.dispatchEvent(itemSpit);

      for (const item of listItemBtns) {
        item.classList.remove("selected");
      }
      $listItemStaged.replaceChildren();
    }
  }
}

class Person {
  constructor(seedMoney) {
    this.myMoney = seedMoney;
  }

  ready() {
    this.updateMoney();

    $btnInsert.addEventListener("click", () => {
      this.insertMoney();
    }); //주의
    $btnReturn.addEventListener("moneyspit", e => {
      this.takeChange(e);
    }); //주의
    $btnGet.addEventListener("itemspit", e => {
      this.takeItem(e);
    });
  }

  insertMoney() {
    const insertedMoney = parseInt($inpInsert.value);

    if (insertedMoney) {
      if (insertedMoney <= this.myMoney && insertedMoney > 0) {
        const moneyInserted = new CustomEvent("moneyinserted", {
          detail: { amount: insertedMoney },
        });
        this.myMoney -= parseInt($inpInsert.value);
        this.updateMoney();
        $btnInsert.dispatchEvent(moneyInserted);
      } else {
        alert("소지금이 부족합니다.");
        $inpInsert.value = null;
      }
    }
  }

  updateMoney() {
    $myMoney.textContent = `${addComma(this.myMoney)} 원`;
  }

  takeChange(event) {
    this.myMoney += event.detail.amount;
    this.updateMoney();
  }

  takeItem(event) {
    const frag = document.createDocumentFragment();

    const $listMyItem = $myInfo.querySelector(".list-item-staged");

    event.detail.payload.forEach(item => {
      const myItemNames = [...$listMyItem.querySelectorAll("li")].map(v => v.dataset.name);

      if (myItemNames.includes(item.name)) {
        for (const myItem of [...$listMyItem.querySelectorAll("li")]) {
          if (item.name === myItem.dataset.name) {
            myItem.dataset.count = parseInt(myItem.dataset.count) + parseInt(item.count);

            myItem.querySelector(".num-counter").textContent = myItem.dataset.count;
            break;
          }
        }
      } else {
        const li = document.createElement("li");

        li.setAttribute("data-name", item.name);
        li.setAttribute("data-count", item.count);
        li.setAttribute("data-price", item.price);
        li.setAttribute("data-img", item.img);

        const imgItem = document.createElement("img");
        imgItem.classList.add("img-item");
        imgItem.setAttribute("src", `img/${item.img}`);
        imgItem.setAttribute("alt", "");

        const itemName = document.createElement("strong");
        itemName.classList.add("txt-item");
        itemName.textContent = item.name;

        const itemCount = document.createElement("span");
        itemCount.classList.add("num-counter");
        itemCount.textContent = item.count;

        [imgItem, itemName, itemCount].forEach(v => {
          li.appendChild(v);
        });
        frag.appendChild(li);
        $listMyItem.appendChild(frag);
      }
    });

    let totalMoneySpent = 0;
    [...$listMyItem.querySelectorAll("li")].forEach(v => {
      totalMoneySpent += v.dataset.price * v.dataset.count;
    });
    $myInfo.querySelector(".txt-money-spent").textContent = `총 금액: ${totalMoneySpent} 원`;
  }
}

const machine = new Builder();
machine.setup();

const person = new Person(25000);
person.ready();
