'use strict';

function _random(max) {
    return Math.round(Math.random()*1000)%max;
}

class Store {
    constructor() {
        this.data = [];
        this.backup = null;
        this.selected = null;
        this.id = 1;
    }
    buildData(count = 1000) {
        var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
        var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
        var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
        var data = [];
        for (var i = 0; i < count; i++)
            data.push({id: this.id++, label: adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)] });
        return data;
    }
    updateData(mod = 10) {
        for (let i=0;i<this.data.length;i+=10) {
            this.data[i].label += ' !!!';
        }
    }
    delete(id) {
        const idx = this.data.findIndex(d => d.id==id);
        this.data = this.data.filter((e,i) => i!=idx);
        return this;
    }
    run() {
        this.data = this.buildData();
        this.selected = null;
    }
    add() {
        this.data = this.data.concat(this.buildData(1000));
        this.selected = null;
    }
    update() {
        this.updateData();
        this.selected = null;
    }
    select(id) {
        this.selected = id;
    }
    hideAll() {
        this.backup = this.data;
        this.data = [];
        this.selected = null;
    }
    showAll() {
        this.data = this.backup;
        this.backup = null;
        this.selected = null;
    }
    runLots() {
        this.data = this.buildData(10000);
        this.selected = null;
    }
    clear() {
        this.data = [];
        this.selected = null;
    }
    swapRows() {
        if(this.data.length > 998) {
            var a = this.data[1];
            this.data[1] = this.data[998];
            this.data[998] = a;
        }
    }
}

var getParentId = function(elem) {
    while (elem) {
        if (elem.tagName==="TR") {
            return elem.data_id;
        }
        elem = elem.parentNode;
    }
    return undefined;
}
class Main {
    constructor(props) {
        this.store = new Store();
        this.select = this.select.bind(this);
        this.delete = this.delete.bind(this);
        this.add = this.add.bind(this);
        this.run = this.run.bind(this);
        this.update = this.update.bind(this);
        this.start = 0;
        this.data = [];
        this.selectedRow = null;

        document.getElementById("main").addEventListener('click', e => {
            //console.log("listener",e);
            if (e.target.matches('#add')) {
                e.preventDefault();
                //console.log("add");
                this.add();
            }
            else if (e.target.matches('#run')) {
                e.preventDefault();
                //console.log("run");
                this.run();
            }
            else if (e.target.matches('#update')) {
                e.preventDefault();
                //console.log("update");
                this.update();
            }
            else if (e.target.matches('#hideall')) {
                e.preventDefault();
                //console.log("hideAll");
                this.hideAll();
            }
            else if (e.target.matches('#showall')) {
                e.preventDefault();
                //console.log("showAll");
                this.showAll();
            }
            else if (e.target.matches('#runlots')) {
                e.preventDefault();
                //console.log("runLots");
                this.runLots();
            }
            else if (e.target.matches('#clear')) {
                e.preventDefault();
                //console.log("clear");
                this.clear();
            }
            else if (e.target.matches('#swaprows')) {
                e.preventDefault();
                //console.log("swapRows");
                this.swapRows();
            }
            else if (e.target.matches('.remove')) {
                e.preventDefault();
                let id = getParentId(e.target);
                let idx = this.findIdx(id);
                //console.log("delete",idx);
                this.delete(idx);
            }
            else if (e.target.matches('.lbl')) {
                e.preventDefault();
                let id = getParentId(e.target);
                let idx = this.findIdx(id);
                //console.log("select",idx);
                this.select(idx);
            }
        });
        this.tbody = document.getElementById("tbody");
    }
    findIdx(id) {
        for (let i=0;i<this.data.length;i++){
            if (this.data[i].id === id) return i;
        }
        return undefined;
    }
    run() {
        this.removeAllRows();
        this.store.clear();
        this.data = [];
        this.store.run();
        this.appendRows();
        this.unselect();
    }
    add() {
        this.store.add();
        this.appendRows();
    }
    //#region update
    update() {
      this.store.update();
      for (let i=0;i<this.data.length;i+=10) {
        this.tbody
          .children[i]
          .children[1]
          .children[0]
          .innerText = this.store.data[i].label;
      }
    }
    //#endregion update
    unselect() {
        if (this.selectedRow !== null) {
          const row = this.tbody.children[this.selectedRow]
          if (row) {
            row.className = "";
          }
          this.selectedRow = null;
        }
    }
    select(idx) {
        this.unselect();
        this.store.select(this.data[idx].id);
        this.selectedRow = idx;
        this.tbody.children[idx].className = "danger";
    }
    recreateSelection() {
        let old_selection = this.store.selected;
        let sel_idx = this.store.data.findIndex(d => d.id === old_selection);
        if (sel_idx >= 0) {
            this.store.select(this.data[sel_idx].id);
            this.selectedRow = sel_idx;
            this.tbody.children[sel_idx].className = "danger";
        }
    }
    delete(idx) {
        this.store.delete(this.data[idx].id);
        this.tbody.children[idx].remove();
        this.data.splice(idx, 1);
        this.unselect();
        this.recreateSelection();
    }
    removeAllRows() {
        this.tbody.textContent = "";
    }
    runLots() {
        this.removeAllRows();
        this.store.clear();
        this.data = [];
        this.store.runLots();
        this.appendRows();
        this.unselect();
    }
    clear() {
        this.store.clear();
        this.data = [];
        this.removeAllRows();
        this.unselect();
    }
    swapRows() {
        if (this.data.length>10) {
            this.store.swapRows();
            this.data[1] = this.store.data[1];
            this.data[998] = this.store.data[998];

            this.tbody.insertBefore(this.tbody.children[998], this.tbody.children[2])
            this.tbody.insertBefore(this.tbody.children[1], this.tbody.children[999])
        }
    }
    appendRows() {
        var s_data = this.store.data, data = this.data, tbody = this.tbody;
        for(let i=this.tbody.childElementCount;i<s_data.length; i++) {
            let tr = this.createRow(s_data[i]);
            data[i] = s_data[i];
            tbody.appendChild(tr);
        }
    }
    //#region create-row
    createRow(data) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class='col-md-1'>${data.id}</td>
        <td class='col-md-4'>
            <a class='lbl'>${data.label}</a>
        </td>
        <td class='col-md-1'>
            <a class='remove'><span class='remove glyphicon glyphicon-remove' aria-hidden='true'></span></a>
        </td>
        <td class='col-md-6'></td>
      `;
      tr.data_id = data.id;
      return tr;
    }
    //#endregion create-row
}

new Main();
