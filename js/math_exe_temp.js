document.write(`
<template id = "arithmetic-quiz">
    <div class="container">
      <div class="card-body text-center d-flex flex-column align-items-center">
          <div class="card-body text-center">
            <p class="card-text question"></p>
            <div class="form-group">
              <input type="text" class="form-control answer" />
            </div>
            <button type = "submit" class="btn btn-outline-success my-2 my-sm-0 check-answer">Prüfen</button>
            <p class="result mt-2"></p>
          </div>
        </div>
    </div>
</template>
`);