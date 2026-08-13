export function setButtonText(
  submitBtn,
  isLoading,
  defaultText = "Save",
  loadingText = "Saving..."
) {
  if (!submitBtn) {
    return;
  }

  if (isLoading) {
    submitBtn.textContent = loadingText;
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-disabled", "true");
    submitBtn.setAttribute("aria-busy", "true");
  } else {
    submitBtn.textContent = defaultText;
    submitBtn.removeAttribute("aria-busy");
    if (!submitBtn.classList.contains("modal__submit-btn_disabled")) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute("aria-disabled");
    } else {
      submitBtn.setAttribute("aria-disabled", "true");
    }
  }
}

export function showFormError(formEl, message) {
  let errorEl = formEl.querySelector(".modal__form-error");
  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.className = "modal__form-error";
    errorEl.setAttribute("role", "alert");
    errorEl.setAttribute("aria-live", "assertive");
    formEl.prepend(errorEl);
  }
  errorEl.textContent =
    message || "Something went wrong. Please try again.";
  errorEl.hidden = false;
}

export function clearFormError(formEl) {
  const errorEl = formEl.querySelector(".modal__form-error");
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }
}

export function setFormBusy(formEl, isBusy) {
  if (!formEl) {
    return;
  }

  if (isBusy) {
    formEl.setAttribute("aria-busy", "true");
  } else {
    formEl.removeAttribute("aria-busy");
  }
}
