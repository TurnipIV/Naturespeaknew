function __boot() {
  document.getElementById('game-content').style.display = "block"
  let button = document.getElementById('powerbutton')
  
  if (button.classList.toggle('powered')) {
    const script = document.createElement("script")
    script.src = "script/game.js"
    script.setAttribute("id", "main")
    document.body.appendChild(script)
    document.getElementById('__boot').style.display = "none"
    document.getElementById('game-outer').style.display = "block"
  } else {
    location.reload()
  }
  
  
}
//<script src="script/game.js"></script>