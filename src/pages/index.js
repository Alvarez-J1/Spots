import logoSrc from "../images/logo.svg";
import {
  setButtonText,
  showFormError,
  clearFormError,
} from "../utils/helpers.js";
import editBtnSrc from "../images/editBtnSrc.svg";
import plusSrc from "../images/plus.svg";
import Api from "../utils/Api.js";
import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "./validation.js";

const plusImage = document.getElementById("plus__image");
plusImage.src = plusSrc;

const pencilImage = document.getElementById("pencil__image");
pencilImage.src = editBtnSrc;

const logoImage = document.getElementById("logo__image");
logoImage.src = logoSrc;

const footerYear = document.querySelector(".footer__year");
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// Profile elements
const editProfileModal = document.querySelector("#edit-profile-modal");
const profileEditButton = document.querySelector(".profile__edit-btn");
const profileAddButton = document.querySelector(".profile__add-btn");
const profileAvatar = document.querySelector(".profile__avatar");
const profileNameElement = document.querySelector(".profile__name");
const profileDescriptionElement = document.querySelector(
  ".profile__description"
);
const profileSection = document.querySelector(".profile");
const cardsSection = document.querySelector(".cards");
const mainContent = document.getElementById("main-content");
const profileLoadError = document.getElementById("profile-load-error");
const editModalDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const avatarModalBtn = document.querySelector(".profile__avatar-btn");
// Form Elements
const profileForm = document.forms["profile-form"];
const editModalNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const cardModal = document.querySelector("#add-card-modal");
const cardForm = document.forms["card-form"];
const cardSubmitButton = cardModal.querySelector(".modal__submit-btn");

// Avatar Elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = document.forms["avatar-form"];
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Delete Form Elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.forms["remove-form"];
const deleteTitle = deleteModal.querySelector("#delete-title");
const cancelBtn = deleteModal.querySelector("#cancel-btn");

// Card-related
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");
const cardsEmpty = document.getElementById("cards-empty");
const cardsStatus = document.getElementById("cards-status");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const cardNameInput = cardModal.querySelector("#add-card-name-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");

let selectedCard;
let selectedCardId;

const modals = document.querySelectorAll(".modal");

modals.forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

// Modal close buttons
const closeButtons = document.querySelectorAll(".modal__close-btn");

closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => {
    if (popup) {
      closeModal(popup);
    }
  });
});

const API_BASE_URL = "https://around-api.en.tripleten-services.com/v1";
const API_AUTH_TOKEN = "40811508-9c36-428c-adef-ee0a4e68ed5a";
const DEFAULT_CARDS_STATUS_MESSAGE = "Could not update like. Please try again.";
const PROFILE_LOAD_ERROR_MESSAGE =
  "Could not load your profile. Please refresh and try again.";
const CARDS_LOAD_ERROR_MESSAGE =
  "Could not load spots. Please refresh and try again.";
const DELETE_CONFIRMATION_MESSAGE =
  "Are you sure you want to delete this image?";
const DELETE_BUTTON_TEXT = "Delete";
const DELETE_LOADING_TEXT = "Deleting...";
const MISSING_DELETE_SELECTION_MESSAGE = "Choose a card before deleting.";
const FALLBACK_PROFILE_AVATAR_ALT = "Profile picture";
const UNAVAILABLE_PROFILE_AVATAR_ALT = "Profile picture unavailable";
const UNAVAILABLE_IMAGE_ALT = "Image unavailable";

const api = new Api({
  baseUrl: API_BASE_URL,
  headers: {
    authorization: API_AUTH_TOKEN,
    "Content-Type": "application/json",
  },
});

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23ece3cf'/%3E%3Ctext x='50%25' y='50%25' fill='%23a89c80' font-family='Poppins, Arial, sans-serif' font-size='22' text-anchor='middle' dominant-baseline='middle'%3EImage unavailable%3C/text%3E%3C/svg%3E";

profileAvatar.addEventListener("error", () => {
  profileAvatar.src = PLACEHOLDER_IMAGE;
  profileAvatar.alt = UNAVAILABLE_PROFILE_AVATAR_ALT;
});

previewModalImageEl.addEventListener("error", () => {
  const caption = previewModalCaptionEl.textContent;
  previewModalImageEl.src = PLACEHOLDER_IMAGE;
  previewModalImageEl.alt = caption
    ? `${caption} (image unavailable)`
    : UNAVAILABLE_IMAGE_ALT;
});

api
  .getAppInfo()
  .then(([cards, userData]) => {
    profileAvatar.src = userData.avatar;
    profileNameElement.textContent = userData.name;
    profileDescriptionElement.textContent = userData.about;
    updateProfileAvatarAlt(userData.name);
    cards.forEach((item) => {
      renderCard(item, "append");
    });
    updateCardsEmptyState();
  })

  .catch((err) => {
    console.error(err);
    profileLoadError.textContent =
      err instanceof Error && err.message
        ? err.message
        : PROFILE_LOAD_ERROR_MESSAGE;
    profileLoadError.hidden = false;
    profileSection.setAttribute("aria-describedby", "profile-load-error");
    showCardsStatus(CARDS_LOAD_ERROR_MESSAGE);
  })
  .finally(() => {
    profileSection.removeAttribute("aria-busy");
    cardsSection.removeAttribute("aria-busy");
  });

function updateProfileAvatarAlt(name) {
  profileAvatar.alt = name
    ? `${name}'s profile picture`
    : FALLBACK_PROFILE_AVATAR_ALT;
}

function updateCardsEmptyState() {
  cardsEmpty.hidden = cardsList.childElementCount > 0;
}

function showCardsStatus(message) {
  cardsStatus.textContent = message || DEFAULT_CARDS_STATUS_MESSAGE;
  cardsStatus.hidden = false;
  cardsSection.setAttribute("aria-describedby", "cards-status");
}

function clearCardsStatus() {
  cardsStatus.hidden = true;
  cardsStatus.textContent = "";
  cardsSection.removeAttribute("aria-describedby");
}

function getSubmitButton(form, evt) {
  return evt.submitter || form?.querySelector(settings.submitButtonSelector);
}

function updateLikeButtonState(button, isLiked, cardName = "") {
  button.setAttribute("aria-pressed", isLiked ? "true" : "false");
  const action = isLiked ? "Unlike" : "Like";
  button.setAttribute(
    "aria-label",
    cardName ? `${action} ${cardName}` : action
  );
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardImageBtn = cardElement.querySelector(".card__image-btn");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardRemoveBtn = cardElement.querySelector(".card__remove-btn");

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
    cardElement.classList.add("card_liked");
  }
  updateLikeButtonState(cardLikeBtn, Boolean(data.isLiked), data.name);

  cardNameEl.textContent = data.name;
  cardImageBtn.setAttribute("aria-label", `View ${data.name} in full size`);
  cardImageEl.alt = "";
  cardRemoveBtn.setAttribute("aria-label", `Delete ${data.name}`);
  cardImageEl.addEventListener("error", () => {
    cardImageEl.src = PLACEHOLDER_IMAGE;
  });
  cardImageEl.src = data.link;

  cardImageBtn.addEventListener("click", () => {
    previewModalCaptionEl.textContent = data.name;
    previewModalImageEl.alt = data.name;
    previewModalImageEl.src = data.link;
    openModal(previewModal);
  });

  cardLikeBtn.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  cardRemoveBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );
  return cardElement;
}

let lastFocusedElement;

function openModal(modal) {
  if (!modal) {
    return;
  }

  if (modal.classList.contains("modal_opened")) {
    return;
  }

  lastFocusedElement = document.activeElement;
  modal.classList.add("modal_opened");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  mainContent.inert = true;
  document.addEventListener("keydown", handleEscapeKey);
  modal.querySelectorAll(".modal__form").forEach(clearFormError);
  const firstInput = modal.querySelector(".modal__input");
  const closeBtn = modal.querySelector(".modal__close-btn");
  if (firstInput) {
    firstInput.focus();
  } else if (closeBtn) {
    closeBtn.focus();
  }
}

function closeModal(modal) {
  if (!modal) {
    return;
  }

  if (!modal.classList.contains("modal_opened")) {
    return;
  }

  modal.classList.remove("modal_opened");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  mainContent.inert = false;
  document.removeEventListener("keydown", handleEscapeKey);
  if (modal === previewModal) {
    previewModalImageEl.removeAttribute("src");
    previewModalImageEl.alt = "";
    previewModalCaptionEl.textContent = "";
  }
  if (modal === deleteModal) {
    deleteTitle.textContent = DELETE_CONFIRMATION_MESSAGE;
    selectedCard = undefined;
    selectedCardId = undefined;
  }
  if (lastFocusedElement?.isConnected) {
    lastFocusedElement.focus();
  }
  lastFocusedElement = undefined;
}

function handleEscapeKey(event) {
  if (event.key === "Escape") {
    const openModal = document.querySelector(".modal_opened");
    if (openModal) {
      closeModal(openModal);
    }
  }
}

function handleLike(evt, cardId) {
  const likeButton = evt.currentTarget;
  if (likeButton.disabled) {
    return;
  }

  clearCardsStatus();
  const isLiked = likeButton.classList.contains("card__like-btn_liked");
  likeButton.disabled = true;
  likeButton.setAttribute("aria-disabled", "true");
  likeButton.setAttribute("aria-busy", "true");

  api
    .changeLikeStatus(cardId, isLiked)
    .then((updatedData) => {
      if (updatedData.isLiked) {
        likeButton.classList.add("card__like-btn_liked");
      } else {
        likeButton.classList.remove("card__like-btn_liked");
      }
      const cardName = likeButton
        .closest(".card")
        ?.querySelector(".card__title")
        ?.textContent.trim();
      updateLikeButtonState(likeButton, Boolean(updatedData.isLiked), cardName);
      clearCardsStatus();
    })
    .catch((err) => {
      console.error(err);
      showCardsStatus(err?.message);
    })
    .finally(() => {
      likeButton.disabled = false;
      likeButton.removeAttribute("aria-disabled");
      likeButton.removeAttribute("aria-busy");
    });
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  const cardName = cardElement
    .querySelector(".card__title")
    ?.textContent.trim();
  deleteTitle.textContent = cardName
    ? `Are you sure you want to delete "${cardName}"?`
    : DELETE_CONFIRMATION_MESSAGE;
  openModal(deleteModal);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const form = evt.target;
  clearFormError(form);
  const submitBtn = getSubmitButton(form, evt);
  setButtonText(submitBtn, true);

  api
    .editUserInfo({
      name: editModalNameInput.value.trim(),
      about: editModalDescriptionInput.value.trim(),
    })
    .then((data) => {
      profileNameElement.textContent = data.name;
      profileDescriptionElement.textContent = data.about;
      updateProfileAvatarAlt(data.name);
      form.reset();
      closeModal(editProfileModal);
    })
    .catch((err) => {
      console.error(err);
      showFormError(form, err?.message);
    })
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  const form = evt.target;
  clearFormError(form);
  const submitBtn = getSubmitButton(form, evt);
  setButtonText(submitBtn, true);

  const avatar = avatarInput.value.trim();
  api
    .editAvatar(avatar)
    .then((userData) => {
      profileAvatar.src = userData.avatar;
      updateProfileAvatarAlt(profileNameElement.textContent.trim());
      form.reset();
      closeModal(avatarModal);
    })
    .catch((err) => {
      console.error(err);
      showFormError(form, err?.message);
    })
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const form = evt.target;
  clearFormError(form);
  if (!selectedCard || !selectedCardId) {
    showFormError(form, MISSING_DELETE_SELECTION_MESSAGE);
    return;
  }
  const submitBtn = getSubmitButton(form, evt);
  setButtonText(submitBtn, true, DELETE_BUTTON_TEXT, DELETE_LOADING_TEXT);
  api
    .removeCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      lastFocusedElement = cardsList;
      updateCardsEmptyState();
      clearCardsStatus();
      closeModal(deleteModal);
    })
    .catch((err) => {
      console.error(err);
      showFormError(form, err?.message);
    })
    .finally(() => {
      setButtonText(submitBtn, false, DELETE_BUTTON_TEXT, DELETE_LOADING_TEXT);
    });
}

function renderCard(item, method = "prepend") {
  const cardElement = getCardElement(item);
  cardsList[method](cardElement);
  updateCardsEmptyState();
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const form = evt.target;
  clearFormError(form);
  const submitBtn = getSubmitButton(form, evt);
  setButtonText(submitBtn, true);
  const inputValues = {
    name: cardNameInput.value.trim(),
    link: cardLinkInput.value.trim(),
  };
  api
    .addNewCard(inputValues)
    .then((data) => {
      renderCard(data);
      clearCardsStatus();
      form.reset();
      disableButton(cardSubmitButton, settings);
      closeModal(cardModal);
    })
    .catch((err) => {
      console.error(err);
      showFormError(form, err?.message);
    })
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileNameElement.textContent;
  editModalDescriptionInput.value = profileDescriptionElement.textContent;
  resetValidation(
    profileForm,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
  openModal(editProfileModal);
});

profileAddButton.addEventListener("click", () => {
  cardForm.reset();
  resetValidation(cardForm, [cardLinkInput, cardNameInput], settings);
  openModal(cardModal);
});

avatarModalBtn.addEventListener("click", () => {
  avatarForm.reset();
  resetValidation(avatarForm, [avatarInput], settings);
  openModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarFormSubmit);

profileForm.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

deleteForm.addEventListener("submit", handleDeleteSubmit);

cancelBtn.addEventListener("click", (evt) => {
  evt.preventDefault();
  closeModal(deleteModal);
});

enableValidation(settings);
