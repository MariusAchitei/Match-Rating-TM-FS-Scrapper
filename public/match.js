

// console.log('miai');
// const buttons =document.querySelectorAll('.info-note>button, .bottom_motm');
// for(let button of buttons){
//     button.addEventListener('click', function() {
//         console.log('bun');
//         button.classList.toggle('pressed');
//     })
// }

// const radios =document.querySelectorAll('label');
// for(let radio of radios){
//     radio.addEventListener('click', function() {
//         console.log('bun');
//         radio.classList.toggle('pressed');
//     })
// }

// const forms = document.querySelectorAll('form');
// for(let form of forms){
//     form.addEventListener('change', handleChangeLabel)
// }
// function handleChangeLabel(event){
//     const changedThing = event.target;

//     allBtn = changedThing.parentElement.children;
//     for(let btn of allBtn){
//         // if(btn.classList.contains('pressed')){
//             btn.classList.remove('pressed');
//         // }
//     }

//     changedThing.parentElement.classList.toggle('pressed');
// }

// const forms =document.querySelectorAll('form');
// const buttons = document.querySelectorAll('button');
// for(let button of buttons){
//         button.addEventListener('change', function(){
//             console.log('bun');
//             button.classList.toggle('pressed');
//         });
//     }

// const forms = document.querySelectorAll('.rating-section form');
// for(let form of forms){
//     labels = form.childNodes;
//     for(let label of labels){
//         nota = label.innerText;
//         label.innerText = "";
//         console.log(label.innerHTML);
//         label.innerHTML = `<span>${nota}</span>`;
//     }

// }

// $('.form label input[type="radio"]').click(function() {
//     $(this).parent().addClass('pressed').siblings('label').removeClass('pressed')
//   });

const inputs = document.querySelectorAll('form label input');
for (let input of inputs) {
  input.addEventListener('click', ApasareNote);
}

const inputsMotm = document.querySelectorAll('.bottom_motm input');
for (inputMotm of inputsMotm) {
  inputMotm.addEventListener('change', ApasareMotm);
}

function ApasareNote() {
  const labels = this.parentElement.parentElement.children;
  for (let label of labels) {
    label.classList.remove('pressed');
  }
  this.parentNode.classList.add('pressed');
}

function ApasareMotm() {
  console.log('bun');
  const labels = document.querySelectorAll('.bottom_motm');
  for (let label of labels) {
    label.classList.remove('pressedMotm');
  }
  this.parentElement.parentElement.classList.add('pressedMotm');

}
console.log("vai de plm");