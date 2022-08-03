
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

const buttonSubmitHost = document.querySelector('#submitHost');
const ratingHost = document.querySelector('#ratingHost');

ratingHost.addEventListener('submit', submitListen)

function submitListen(event) {
  event.preventDefault();
  //console.log(this.elements);
  const sentData = {
    note: [],
    potm: ''
  };

  const array = [...this.elements]
  array.forEach(input => {
    if (input.checked) {
      if (input.name !== 'potm') {
        const structNota = {};
        structNota.id = input.name;
        structNota.score = input.value
        sentData.note.push(structNota)
      }
      else {
        sentData.potm = input.value;
      }
    }
  });

  console.log(sentData)

  axios({
    method: 'post',
    url: `/Superliga/matches/${this.elements[0].value}`,
    headers: {},
    data: {
      meci: this.elements[0].value,
      note: sentData.note,
      potm: sentData.potm
    }
  })
    .then(function (res) {
      console.log(res.data)
    })
    .catch(function (err) {
      console.log(err)
    })

  // axios({
  //   method: 'post',
  //   url: `/Superliga/matches${this.elements[0].value}`,
  //   data: data
  // })
  //   .then((res) => {
  //     //console.log(res)
  //   })
  //   .catch((err) => {
  //     //console.log(err)
  //   });
}

