class ArithmeticQuiz extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(
        document.querySelector('#arithmetic-quiz').content.cloneNode(true)
      );
  
      this._question = this.shadowRoot.querySelector('.question');
      this._answer = this.shadowRoot.querySelector('.answer');
      this._result = this.shadowRoot.querySelector('.result');
      this._checkAnswerButton = this.shadowRoot.querySelector('.check-answer');
  
      this._checkAnswerButton.addEventListener('click', () => {
        this.checkAnswer();
      });
  
      this.generateQuestion();

    }
  
    generateQuestion() {
      const num1 = Math.floor(Math.random() * 10);
      const num2 = Math.floor(Math.random() * 10);
      const operator = Math.random() < 0.5 ? '+' : '-';
      this._question.textContent = `${num1} ${operator} ${num2} =`;
      this._correctAnswer = eval(`${num1} ${operator} ${num2}`);
    }
  
    checkAnswer() {
      const answer = Number(this._answer.value);
      if (answer === this._correctAnswer) {
        this._result.textContent = 'Korrekt!';
        fetch('/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
        location.reload()
          .then(response => {
            if (!response.ok) throw new Error('Failed to increase user score');
            return response.json();
          })
          .then(data => console.log(data))
          .catch(error => console.error(error));
      } else {
        this._result.textContent = 'Inkorrekt!';
      }
    }
  }
  
  customElements.define('arithmetic-quiz', ArithmeticQuiz);