document.addEventListener('DOMContentLoaded', main);


const BASE_URL = 'http://localhost:3000/posts';
let lastDeletedPost = null;

function main() {
  displayPosts();
  addNewPostListener();
}

// Fetch and display all posts
function displayPosts() {
  fetch(BASE_URL)
    .then(res => res.json())
    .then(posts => {
      const list = document.getElementById('post-list');
      list.innerHTML = '';

      if (posts.length === 0) {
        document.getElementById('post-detail').innerHTML = '<p>No posts available.</p>';
        return;
      }

      posts.forEach(post => {
        const div = document.createElement('div');
        div.textContent = post.title;
        div.classList.add('post-title');
        div.addEventListener('click', () => handlePostClick(post.id));
        list.appendChild(div);
      });

      const detail = document.getElementById('post-detail');
      if (!detail.innerHTML || detail.innerHTML.includes("Select a post") || detail.innerHTML.includes("No posts")) {
        handlePostClick(posts[0].id);
      }
    });
}

// Show single post details
function handlePostClick(id) {
  fetch(`${BASE_URL}/${id}`)
    .then(res => res.json())
    .then(post => {
      const detail = document.getElementById('post-detail');
      detail.innerHTML = `
        <h2>${post.title}</h2>
        <p>${post.content}</p>
        <p><em>by ${post.author}</em></p>
        <button id="edit-btn">Edit</button>
        <button id="delete-btn">Delete</button>
      `;

      setupEdit(post);
      setupDelete(post.id);
    });
}

// Handle new post creation
function addNewPostListener() {
  const form = document.getElementById('new-post-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newPost = {
      title: document.getElementById('new-title').value,
      content: document.getElementById('new-content').value,
      author: document.getElementById('new-author').value
    };

    fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    })
      .then(res => res.json())
      .then(() => {
        displayPosts();
        form.reset();
      });
  });
}

// Setup edit functionality
function setupEdit(post) {
  const editForm = document.getElementById('edit-post-form');
  editForm.classList.remove('hidden');

  document.getElementById('edit-title').value = post.title;
  document.getElementById('edit-content').value = post.content;

  editForm.onsubmit = (e) => {
    e.preventDefault();

    const updatedPost = {
      title: document.getElementById('edit-title').value,
      content: document.getElementById('edit-content').value
    };

    fetch(`${BASE_URL}/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost)
    })
      .then(res => res.json())
      .then(() => {
        displayPosts();
        handlePostClick(post.id);
        editForm.classList.add('hidden');
      });
  };

  document.getElementById('cancel-edit').onclick = () => {
    editForm.classList.add('hidden');
  };
}

// Setup delete functionality with undo
function setupDelete(postId) {
  const deleteBtn = document.getElementById('delete-btn');
  deleteBtn.onclick = () => {
    fetch(`${BASE_URL}/${postId}`)
      .then(res => res.json())
      .then(post => {
        lastDeletedPost = post;

        return fetch(`${BASE_URL}/${postId}`, {
          method: 'DELETE'
        });
      })
      .then(() => {
        displayPosts();
        document.getElementById('post-detail').innerHTML = '<p>Select a post to view details.</p>';
        document.getElementById('edit-post-form').classList.add('hidden');
        showUndoOption();
      });
  };
}

function showUndoOption() {
  const existing = document.getElementById('undo-container');
  if (existing) existing.remove();

  const undoContainer = document.createElement('div');
  undoContainer.id = 'undo-container';
  undoContainer.innerHTML = `
    <div style="background:#EEDCFF; padding:12px; margin-top:16px; border-radius:8px; color:#4e4b5c; text-align:center;">
      <strong>Post deleted.</strong>
      <button id="undo-btn" style="margin-left:12px; background:#8983F0; color:white; padding:8px 16px; border:none; border-radius:6px; cursor:pointer;">Undo</button>
    </div>
  `;
  document.body.appendChild(undoContainer);

  document.getElementById('undo-btn').addEventListener('click', () => {
    if (lastDeletedPost) {
      fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastDeletedPost)
      })
        .then(() => {
          displayPosts();
          undoContainer.remove();
          lastDeletedPost = null;
        });
    }
  });

  setTimeout(() => {
    if (document.body.contains(undoContainer)) {
      undoContainer.remove();
      lastDeletedPost = null;
    }
  }, 10000);
}
