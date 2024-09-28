export const handleCopy = (emrId: string) => {
  const temp = document.createElement("textarea");
  document.body.appendChild(temp);
  temp.value = emrId;
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
};
