      function toggle() {
        var adopt = document.getElementById("pet-adopt");
        var release = document.getElementById("pet-release");
        
        if (release.style.display === "none") {
            release.style.display = "block";
            adopt.style.display = "none";
        } else {
            release.style.display = "none";
            adopt.style.display = "block";
        }
      }