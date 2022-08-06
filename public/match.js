
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

  //console.log(sentData)

  axios({
    method: 'post',
    url: `/Superliga/matches/${this.elements[0].value}`,
    data: {
      meci: this.elements[0].value,
      team: this.elements[1].value,
      note: sentData.note,
      potm: sentData.potm
    }
  })
    .then(function (res) {
      const main = document.querySelector('main')
      const p = document.createElement('p')
      p.style.color = 'black';
      const team = document.querySelector('.team').value;
      let procent;

      if (team == 'host') {
        procent = ((res.data.hostPotm.curent * 100) / res.data.hostPotm.total).toFixed(2);
        p.innerText = res.data.hostPotm.id.first + '  ' + res.data.hostPotm.id.last + '  ' + procent
      }
      else {
        procent = ((res.data.visitPotm.curent * 100) / res.data.visitPotm.total).toFixed(2);
        p.innerText = res.data.visitPotm.id.first + '  ' + res.data.visitPotm.id.last + '  ' + procent
      }


      main.appendChild(p);

      //const divs = document.querySelectorAll('.profil')
      // const ids = document.querySelectorAll('.playerId').value
      // const lasts = document.querySelectorAll('.lastName').innerText
      // const firsts = document.querySelectorAll('.firstName').innerText
      const scores = document.querySelectorAll('.scor')

      console.log(scores);

      let i = 0
      scores.forEach(score => {
        if (team == 'host') {
          score.innerText = (res.data.hostSquad[i].nota / res.data.hostSquad[i].voturi).toFixed(2);
        }
        else {
          score.innerText = (res.data.visitSquad[i].nota / res.data.visitSquad[i].voturi).toFixed(2);
        }
        i++;
      });
      //console.log(names.innerText)

    })
    .catch(function (err) {
      console.log(err)
    })

}

