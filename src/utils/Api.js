export default class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  // Unified internal method for making requests
  _request(endpoint, options = {}) {
    const finalOptions = {
      headers: this._headers,
      ...options,
    };

    const url = `${this._baseUrl}${endpoint}`;
    return fetch(url, finalOptions).then(this._processResponse);
  }

  _processResponse(res) {
    if (res.ok) {
      if (res.status === 204) return Promise.resolve(null);
      return res.json();
    }
    return res
      .json()
      .catch(() => null)
      .then((body) => {
        const message =
          (body && body.message) ||
          res.statusText ||
          `Request failed with status ${res.status}`;
        return Promise.reject(new Error(message));
      });
  }

  getUserInfo() {
    return this._request("/users/me");
  }

  editUserInfo({ name, about }) {
    return this._request("/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        name,
        about,
      }),
    });
  }

  editAvatar(avatar) {
    return this._request("/users/me/avatar", {
      method: "PATCH",
      body: JSON.stringify({ avatar }),
    });
  }

  getInitialCards() {
    return this._request("/cards");
  }

  addNewCard({ name, link }) {
    return this._request("/cards", {
      method: "POST",
      body: JSON.stringify({ name, link }),
    });
  }

  removeCard(cardId) {
    return this._request(`/cards/${encodeURIComponent(cardId)}`, {
      method: "DELETE",
    });
  }

  changeLikeStatus(cardId, isLiked) {
    return this._request(`/cards/${encodeURIComponent(cardId)}/likes`, {
      method: isLiked ? "DELETE" : "PUT",
    });
  }

  getAppInfo() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }
}
