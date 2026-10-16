/**
 * @typedef {Object} ApiUser
 * @property {string} name
 * @property {string} about
 * @property {string} avatar
 *
 * @typedef {Object} ApiCard
 * @property {string} _id
 * @property {string} name
 * @property {string} link
 * @property {boolean} isLiked
 */

export default class Api {
  /** @param {{baseUrl: string, headers: Record<string, string>}} options */
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  /**
   * @param {string} endpoint
   * @param {RequestInit} [options]
   */
  _request(endpoint, options = {}) {
    const finalOptions = {
      headers: this._headers,
      ...options,
    };

    const url = `${this._baseUrl}${endpoint}`;
    return fetch(url, finalOptions).then(this._processResponse);
  }

  /** @param {Response} res */
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
          (typeof body?.message === "string" && body.message.trim()) ||
          res.statusText ||
          `Request failed with status ${res.status}`;
        return Promise.reject(new Error(message));
      });
  }

  /** @returns {Promise<ApiUser>} */
  getUserInfo() {
    return this._request("/users/me");
  }

  /**
   * @param {Pick<ApiUser, "name" | "about">} profile
   * @returns {Promise<ApiUser>}
   */
  editUserInfo({ name, about }) {
    return this._request("/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        name,
        about,
      }),
    });
  }

  /**
   * @param {string} avatar
   * @returns {Promise<ApiUser>}
   */
  editAvatar(avatar) {
    return this._request("/users/me/avatar", {
      method: "PATCH",
      body: JSON.stringify({ avatar }),
    });
  }

  /** @returns {Promise<ApiCard[]>} */
  getInitialCards() {
    return this._request("/cards");
  }

  /**
   * @param {Pick<ApiCard, "name" | "link">} card
   * @returns {Promise<ApiCard>}
   */
  addNewCard({ name, link }) {
    return this._request("/cards", {
      method: "POST",
      body: JSON.stringify({ name, link }),
    });
  }

  /** @param {string} cardId */
  removeCard(cardId) {
    return this._request(`/cards/${encodeURIComponent(cardId)}`, {
      method: "DELETE",
    });
  }

  /**
   * @param {string} cardId
   * @param {boolean} isLiked
   * @returns {Promise<ApiCard>}
   */
  changeLikeStatus(cardId, isLiked) {
    return this._request(`/cards/${encodeURIComponent(cardId)}/likes`, {
      method: isLiked ? "DELETE" : "PUT",
    });
  }

  /** @returns {Promise<[ApiCard[], ApiUser]>} */
  getAppInfo() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }
}
