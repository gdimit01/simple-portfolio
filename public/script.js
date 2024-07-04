document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    alert(
      "Signal received! Your transmission has been logged in the mainframe."
    );
  });

document
  .getElementById("uploadForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const fileInput = document.getElementById("fileUpload");
    const file = fileInput.files[0];
    if (file) {
      uploadFile(file);
    }
  });

function uploadFile(file) {
  const formData = new FormData();
  formData.append("fileUpload", file);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Digital artifact successfully uploaded to the grid!");
        listFiles();
      } else {
        alert("Upload failed. The system firewalls may be active.");
      }
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
      alert("Upload failed. There might be a glitch in the matrix.");
    });
}

function listFiles() {
  fetch("/files")
    .then((response) => response.json())
    .then((files) => {
      console.log("Files fetched from server:", files); // Debugging output

      const order =
        JSON.parse(localStorage.getItem("fileOrder")) ||
        files.map((file) => file.name);
      const fileList = document.getElementById("fileList");
      fileList.innerHTML = "";

      order.forEach((fileName, index) => {
        const file = files.find((f) => f.name === fileName);
        if (file) {
          const fileItem = document.createElement("div");
          fileItem.classList.add("file-item");
          fileItem.innerHTML = `
                    <img src="/uploads/${file.name}" alt="${file.originalName}">
                    <span>Artifact ${index + 1} uploaded at ${new Date(
            file.timestamp
          ).toLocaleString()}</span>
                    <button onclick="deleteFile('${file.name}')">Delete</button>
                `;
          fileList.appendChild(fileItem);
        }
      });

      new Sortable(fileList, {
        animation: 150,
        ghostClass: "dragging",
        onEnd: function (evt) {
          const newOrder = Array.from(fileList.children).map((child) => {
            return child.querySelector("span").textContent.split(" ")[1];
          });
          localStorage.setItem("fileOrder", JSON.stringify(newOrder));
        },
      });

      const images = document.querySelectorAll(".file-item img");
      images.forEach((img) => {
        img.addEventListener("mouseover", () => {
          img.style.animation = "neonFlicker 0.2s infinite";
        });
        img.addEventListener("mouseout", () => {
          img.style.animation = "none";
        });
      });
    })
    .catch((error) => {
      console.error("Error listing files:", error);
    });
}

function deleteFile(fileName) {
  fetch(`/delete?fileName=${encodeURIComponent(fileName)}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Digital artifact successfully purged from the grid!");
        listFiles();
      } else {
        alert("Deletion failed. The artifact may be protected.");
      }
    })
    .catch((error) => {
      console.error("Error deleting file:", error);
      alert("Deletion failed. There might be a glitch in the system.");
    });
}

listFiles();

const style = document.createElement("style");
style.textContent = `
    @keyframes neonFlicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
`;
document.head.appendChild(style);
