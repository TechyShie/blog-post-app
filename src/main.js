const BASE_URL = "http://localhost:3000/posts";

const postList = document.getElementById("post-list");
const postDetail = document.getElementById("post-detail");
const postCount = document.getElementById("post-count");
const form = document.getElementById("new-post-form");

const titleInput = document.getElementById("new-title");
const contentInput = document.getElementById("new-content");
const authorInput = document.getElementById("new-author");
const imageInput = document.getElementById("image");
const cancelBtn = document.getElementById("cancel-edit");

document.addEventListener("DOMContentLoaded", () => {
  displayPosts();
  form.addEventListener("submit", handleSubmit);
  cancelBtn?.addEventListener("click", resetForm);
});

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });
}

function displayPosts() {
  fetch(BASE_URL)
    .then(res => res.json())
    .then(posts => {
      postList.innerHTML = "";
      postCount.textContent = `${posts.length} post${posts.length !== 1 ? "s" : ""}`;
      posts.forEach(post => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.textContent = post.title;
        item.onclick = () => showPost(post);
        postList.appendChild(item);
      });
      if (posts.length) showPost(posts[0]);
    });
}

function showPost(post) {
  const imageSection = `
    <div class="post-hero" style="background-image: url('${post.image || "https://via.placeholder.com/600x300?text=No+Image"}');">
      <div class="overlay-content">
        <h2>${post.title}</h2>
        <p class="post-meta">By ${post.author} • ${formatDate(post.date)}</p>
        <p>${post.content}</p>
        <div class="post-actions">
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  `;

  postDetail.innerHTML = imageSection;

  postDetail.querySelector(".delete-btn").onclick = () => deletePost(post.id);
  postDetail.querySelector(".edit-btn").onclick = () => loadEdit(post);
}




function handleSubmit(e) {
  e.preventDefault();
  const postData = {
    title: titleInput.value,
    content: contentInput.value,
    author: authorInput.value,
    image: imageInput.value,
    date: new Date().toISOString()
  };
  const editing = form.dataset.editing;
  const url = editing ? `${BASE_URL}/${editing}` : BASE_URL;
  const method = editing ? "PATCH" : "POST";

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData)
  }).then(() => {
    resetForm();
    displayPosts();
  });
}

function loadEdit(post) {
  titleInput.value = post.title;
  contentInput.value = post.content;
  authorInput.value = post.author;
  imageInput.value = post.image || "";
  form.dataset.editing = post.id;
  form.querySelector("button[type='submit']").textContent = "Update Post";

  // ✅ Show the cancel button ONLY when editing
  cancelBtn.classList.remove("hidden");
}

function resetForm() {
  form.reset();
  delete form.dataset.editing;
  form.querySelector("button[type='submit']").textContent = "Create Post";

  // ✅ Hide the cancel button when not editing
  cancelBtn.classList.add("hidden");
}


function deletePost(id) {
  fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
    .then(() => {
      postDetail.innerHTML = "<p>Post deleted. Select another post.</p>";
      displayPosts();
      resetForm(); // optional: reset form if deleting the post being edited
    });
}
