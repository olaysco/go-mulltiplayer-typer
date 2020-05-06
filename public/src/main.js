let validateFields = (...elems) => {
  return elems.every((e) => {
    const valid = e.checkValidity();
    if (!valid) {
      e.reportValidity();
    }
    return valid;
  });
};

let hideAndShow = (toHide, toShow) => {
  hide(toHide);
  show(toShow);
  return true;
};

let hide = (toHide) => {
  toHide.classList.add("d-none");
};

let show = (toShow) => {
  toShow.classList.remove("d-none");
};

let strToLower = (str) => String(str).toLowerCase();

let openFullscreen = () => {
  let elemView = document.documentElement;
  if (elemView.requestFullscreen) {
    elemView.requestFullscreen();
  } else if (elemView.mozRequestFullScreen) {
    elemView.mozRequestFullScreen();
  } else if (elemView.webkitRequestFullscreen) {
    elemView.webkitRequestFullscreen();
  } else if (elemView.msRequestFullscreen) {
    elemView.msRequestFullscreen();
  }
};
