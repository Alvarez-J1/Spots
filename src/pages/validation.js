import { addDescription, removeDescription } from "../utils/aria.js";

export const settings = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn[type='submit']",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
};

const showInputError = (formEl, inputEl, errorMsg, config) => {
  const errorMsgEl = formEl.querySelector(`#${inputEl.id}-error`);
  if (errorMsgEl) {
    errorMsgEl.textContent = errorMsg;
  }
  inputEl.classList.add(config.inputErrorClass);
  inputEl.setAttribute("aria-invalid", "true");
  if (errorMsgEl) {
    addDescription(inputEl, errorMsgEl.id);
  }
};

const hideInputError = (formEl, inputEl, config) => {
  const errorMsgEl = formEl.querySelector(`#${inputEl.id}-error`);
  if (errorMsgEl) {
    errorMsgEl.textContent = "";
  }
  inputEl.classList.remove(config.inputErrorClass);
  inputEl.removeAttribute("aria-invalid");
  removeDescription(inputEl, `${inputEl.id}-error`);
};
const checkInputValidity = (formEl, inputEl, config) => {
  if (inputEl.willValidate && !inputEl.validity.valid) {
    showInputError(formEl, inputEl, inputEl.validationMessage, config);
  } else {
    hideInputError(formEl, inputEl, config);
  }
};

const hasInvalidInput = (inputList) => {
  return inputList.some((input) => input.willValidate && !input.validity.valid);
};

const toggleButtonState = (inputList, buttonEl, config) => {
  if (!buttonEl) {
    return;
  }

  if (hasInvalidInput(inputList)) {
    disableButton(buttonEl, config);
  } else {
    buttonEl.disabled = buttonEl.form?.getAttribute("aria-busy") === "true";
    if (buttonEl.disabled) {
      buttonEl.setAttribute("aria-disabled", "true");
    } else {
      buttonEl.removeAttribute("aria-disabled");
    }
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

  formEl.addEventListener("submit", (event) => {
    if (formEl.getAttribute("aria-busy") === "true") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const firstInvalidInput = inputList.find(
      (input) => input.willValidate && !input.validity.valid
    );
    if (firstInvalidInput) {
      event.preventDefault();
      event.stopImmediatePropagation();
      inputList.forEach((input) => checkInputValidity(formEl, input, config));
      firstInvalidInput.focus();
    }
  }, { capture: true });

  formEl.addEventListener("reset", () => {
    inputList.forEach((input) => hideInputError(formEl, input, config));
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
