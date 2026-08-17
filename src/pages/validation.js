export const settings = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__error",
};

const showInputError = (formEl, inputEl, errorMsg, config) => {
  const errorMsgEl = formEl.querySelector(`#${inputEl.id}-error`);
  if (errorMsgEl) {
    errorMsgEl.textContent = errorMsg;
  }
  inputEl.classList.add(config.inputErrorClass);
  inputEl.setAttribute("aria-invalid", "true");
  if (errorMsgEl) {
    inputEl.setAttribute("aria-describedby", `${inputEl.id}-error`);
  }
};

const getDescribedByIds = (element) =>
  element
    .getAttribute("aria-describedby")
    ?.split(" ")
    .filter(Boolean) || [];

const hideInputError = (formEl, inputEl, config) => {
  const errorMsgEl = formEl.querySelector(`#${inputEl.id}-error`);
  if (errorMsgEl) {
    errorMsgEl.textContent = "";
  }
  inputEl.classList.remove(config.inputErrorClass);
  inputEl.removeAttribute("aria-invalid");
  inputEl.removeAttribute("aria-describedby");
};
const checkInputValidity = (formEl, inputEl, config) => {
  if (!inputEl.validity.valid) {
    showInputError(formEl, inputEl, inputEl.validationMessage, config);
  } else {
    hideInputError(formEl, inputEl, config);
  }
};

const hasInvalidInput = (inputList) => {
  return inputList.some((input) => !input.validity.valid);
};

const toggleButtonState = (inputList, buttonEl, config) => {
  if (!buttonEl) {
    return;
  }

  if (hasInvalidInput(inputList)) {
    disableButton(buttonEl, config);
  } else {
    buttonEl.disabled = false;
    buttonEl.removeAttribute("aria-disabled");
    buttonEl.classList.remove(config.inactiveButtonClass);
  }
};

export const disableButton = (buttonEl, config) => {
  if (!buttonEl) {
    return;
  }

  buttonEl.disabled = true;
  buttonEl.setAttribute("aria-disabled", "true");
  buttonEl.classList.add(config.inactiveButtonClass);
};

export const resetValidation = (formEl, inputList, config) => {
  inputList.forEach((input) => {
    hideInputError(formEl, input, config);
  });
  const buttonElement = formEl.querySelector(config.submitButtonSelector);
  toggleButtonState(inputList, buttonElement, config);
};

const setEventListeners = (formEl, config) => {
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const buttonElement = formEl.querySelector(config.submitButtonSelector);

  if (!buttonElement) {
    return;
  }

  toggleButtonState(inputList, buttonElement, config);

  formEl.addEventListener("reset", () => {
    disableButton(buttonElement, config);
  });

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formEl, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
};

export const enableValidation = (config) => {
  const formList = document.querySelectorAll(config.formSelector);
  formList.forEach((formEl) => {
    setEventListeners(formEl, config);
  });
};
