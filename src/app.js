import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub';
import { createTodo, updateTodo, deleteTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'

import awsconfig from './aws-exports';
API.configure(awsconfig);
PubSub.configure(awsconfig);
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
let locations = ["NYC", "Boston", "Los Angeles", "Houston", "Chicago"]
async function createNewTodo(name, city) {
    const integer = getRandomInt(11)
    const location = getRandomInt(4)
  //const todo = { name: "Property " + integer, description: locations[location]}
  const todo = { name: "Property " + name, description: locations[city]}
  return await API.graphql(graphqlOperation(createTodo, { input: todo }))
}
async function updateToDo(id, name, city) {
  console.log(id, name, city)
  const todo = { id: id, name: name, description: city}
  return await API.graphql(graphqlOperation(updateTodo, { input: todo }))
}

async function deleteToDo(id) {
  console.log("Delete", id)
  const todo = { id: id}
  return await API.graphql(graphqlOperation(deleteTodo, {input:todo}))
}
const MutationButton = document.getElementById('MutationEventButton');

MutationButton.addEventListener('click', (evt) => {
  const integer = getRandomInt(11)
  const location = getRandomInt(4)
  createNewTodo(integer, location).then( (evt) => {
  })
  setTimeout(function(){ table("update") }, 500);
});


async function getData() {
  return await API.graphql(graphqlOperation(listTodos)).then((evt) => {
    return evt.data.listTodos.items
  })
}


function update(oButton) {
  var activeRow = oButton.parentNode.rowIndex;
  var tab = document.getElementById('propertiesTable').rows[activeRow];
  
  for (let i = 1; i < 3; i++) {
          var td = tab.getElementsByTagName("td")[i];
          var ele = document.createElement('input');      // TEXTBOX.
          ele.setAttribute('type', 'text');
          ele.setAttribute('size', '8')
          ele.setAttribute('value', td.innerText);
          td.innerText = '';
          td.appendChild(ele);
  }

  var lblCancel = document.getElementById('lbl' + (activeRow - 1));
  lblCancel.setAttribute('style', 'cursor:pointer; display:block; width:20px; float:left; position: absolute;');

  var btSave = document.getElementById('Save' + (activeRow - 1));
  btSave.setAttribute('style', 'display:block; margin-left:30px; float:left; background-color:#2DBF64;color: white;padding: 1em; border: none;');

  // HIDE THIS BUTTON.
  oButton.setAttribute('style', 'display:none;');
}

function save(oButton, col, properties) {
  console.log(oButton, properties)
  var activeRow = oButton.parentNode.rowIndex;
  console.log(activeRow)
  var tab = document.getElementById('propertiesTable').rows[activeRow];
  // UPDATE database table WITH VALUES.
  var property = []
  for (let i = 0; i < 3; i++) {
      var td = tab.getElementsByTagName("td")[i];
      console.log("Cell", td.innerHTML)
      properties[(activeRow - 1)][col[i]] = td.childNodes[0].value;      // SAVE THE VALUE.
      if (i == 0) {
        property.push(td.innerHTML)
      }
      else {
        property.push(td.childNodes[0].value)
      }
    }
  console.log(property)
  updateToDo(property[0], property[1], property[2]).then( (evt) => {
    
    //MutationResult.innerHTML += `<p>${evt.data.createTodo.name} - ${evt.data.createTodo.description}</p>`
  })
  setTimeout(function(){ table("update") }, 500);
 // table("update");     // REFRESH THE TABLE.
}

function deleteProperty (oButton){
  var activeRow = oButton.parentNode.rowIndex;
  var tab = document.getElementById('propertiesTable').rows[activeRow]
  var td = tab.getElementsByTagName("td")[0];
  deleteToDo(td.innerHTML)
  setTimeout(function(){ table("update") }, 500);                     // REFRESH THE TABLE.
}

async function table(state) {
  //fetch data

  var properties = await getData()
  console.log("Properties", properties)
  var col = []
  for (var i = 0; i < properties.length; i++) {
    for (var key in properties[i]) {
        if (col.indexOf(key) === -1) {
            col.push(key);
        }
    }
}

//create table
var table = document.createElement('table')
  //document.getElementById('container').remove()
  if (state == "new") {
    document.getElementById('container').appendChild(table);
  }
  if (state == "update") {
    
    console.log("Updating Table")
    document.getElementById('container').replaceChild(table, document.getElementById('container').firstChild);
  }
    
//create headers
  table.setAttribute('id', 'propertiesTable')
  var tr = table.insertRow(-1)
  for (var h = 0; h < col.length; h++) {
    // ADD TABLE HEADER.
    var th = document.createElement('th');
    th.innerHTML = col[h].replace('_', ' ');
    tr.appendChild(th);
    if (h == 0) {
      th.setAttribute('style', 'display:none')
    }
  }

  
  //create data columns

  for (var i = 0; i < properties.length; i++) {
    tr = table.insertRow(-1);           // CREATE A NEW ROW.

    for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = properties[i][col[j]];
        if (j == 0) {
          tabCell.setAttribute('style', 'display:none')
        }
    }
    let td = document.createElement('td');
    // *** CANCEL OPTION.
    tr.appendChild(td);
    var lblCancel = document.createElement('label');
    lblCancel.innerHTML = 'X';
    lblCancel.setAttribute('onclick', 'crudApp.Cancel(this)');
    lblCancel.setAttribute('style', 'display:none;');
    lblCancel.setAttribute('title', 'Cancel');
    lblCancel.setAttribute('id', 'lbl' + i);
    td.appendChild(lblCancel);
    // *** SAVE.
    let tdSave = document.createElement('td');
    tr.appendChild(tdSave);
    var btSave = document.createElement('input');
    //btSave.classList.add('app-body')
    btSave.setAttribute('type', 'button');      // SET ATTRIBUTES.
    btSave.setAttribute('value', 'Save');
    btSave.setAttribute('id', 'Save' + i);
    btSave.setAttribute('style', 'display:none;');
    btSave.setAttribute('onclick', 'save(this, properties)');       // ADD THE BUTTON's 'onclick' EVENT.
    btSave.onclick = function() {save(tdSave, col, properties)}
    tdSave.appendChild(btSave);

    // *** UPDATE.
    tr.appendChild(td);
    var btUpdate = document.createElement('input');

    btUpdate.setAttribute('type', 'button');    // SET ATTRIBUTES.
    btUpdate.setAttribute('value', 'Update');
    btUpdate.setAttribute('id', 'Edit' + i);
    btUpdate.setAttribute('style', 'background-color:#ccdbc5;padding: 1em;border:none; ');
    td.appendChild(btUpdate);
    btUpdate.onclick = function() { update(td)}
    

    // *** DELETE.
    let td2 = document.createElement('th');
    tr.appendChild(td2);
    var btDelete = document.createElement('input');
    btDelete.setAttribute('type', 'button');    // SET INPUT ATTRIBUTE.
    btDelete.setAttribute('value', 'Delete');
    btDelete.setAttribute('style', 'background-color:#b5160b;color: white; padding: 1em; border: none');
    btDelete.setAttribute('onclick', 'crudApp.Delete(this)');   // ADD THE BUTTON's 'onclick' EVENT.
    btDelete.onclick = function() { deleteProperty(td2)}
    td2.appendChild(btDelete);
  }

  //create operations columns

}    
table("new")
