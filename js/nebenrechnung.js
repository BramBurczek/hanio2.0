document.write(`
<style>
/* Set the height of the textarea equal to its width */
.square-textarea {
  height: 200px; /* Change this value to set the initial height */
  width: 500px; /* Change this value to set the initial width */
  resize: none; /* Disable resizing of the textarea */
}
</style>
<!-- Use the square-textarea class to create a square textarea element -->
<div class="form-group">
<label for="exampleFormControlTextarea1">Nebenrechnungen:</label>
<textarea class="form-control square-textarea" id="exampleFormControlTextarea1" rows="5"></textarea>
</div>
`);