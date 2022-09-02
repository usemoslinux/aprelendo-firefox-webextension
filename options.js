function saveOptions() {
  browser.storage.sync.set({ "show_ar": document.querySelector("#ar").checked, 
                            "show_zh": document.querySelector("#zh").checked,
                            "show_nl": document.querySelector("#nl").checked,
                            "show_en": document.querySelector("#en").checked,
                            "show_fr": document.querySelector("#fr").checked,
                            "show_de": document.querySelector("#de").checked,
                            "show_el": document.querySelector("#el").checked,
                            "show_he": document.querySelector("#he").checked,
                            "show_hi": document.querySelector("#hi").checked,
                            "show_it": document.querySelector("#it").checked,
                            "show_ja": document.querySelector("#ja").checked,
                            "show_ko": document.querySelector("#ko").checked,
                            "show_pt": document.querySelector("#pt").checked,
                            "show_ru": document.querySelector("#ru").checked,
                            "show_es": document.querySelector("#es").checked
                          }, function() {
                             // Update status to let user know options were saved.
                             var status = document.getElementById('status');
                             status.classList.add("success");
                             status.textContent = 'Options saved!';
                             setTimeout(function() {
                                status.textContent = '';
                             }, 2000);
                          });
}

function restoreOptions() {
  browser.storage.sync.get(["show_ar","show_zh","show_nl","show_en","show_fr",
                             "show_de","show_el","show_he","show_hi","show_it",
                             "show_ja","show_ko","show_pt","show_ru","show_es"], (res) => {
    document.querySelector("#ar").checked = (typeof res.show_ar !== 'undefined') ? res.show_ar : true;
    document.querySelector("#zh").checked = (typeof res.show_zh !== 'undefined') ? res.show_zh : true;
    document.querySelector("#nl").checked = (typeof res.show_nl !== 'undefined') ? res.show_nl : true;
    document.querySelector("#en").checked = (typeof res.show_en !== 'undefined') ? res.show_en : true;
    document.querySelector("#fr").checked = (typeof res.show_fr !== 'undefined') ? res.show_fr : true;
    document.querySelector("#de").checked = (typeof res.show_de !== 'undefined') ? res.show_de : true;
    document.querySelector("#el").checked = (typeof res.show_el !== 'undefined') ? res.show_el : true;
    document.querySelector("#he").checked = (typeof res.show_he !== 'undefined') ? res.show_he : true;
    document.querySelector("#hi").checked = (typeof res.show_hi !== 'undefined') ? res.show_hi : true;
    document.querySelector("#it").checked = (typeof res.show_it !== 'undefined') ? res.show_it : true;
    document.querySelector("#ja").checked = (typeof res.show_ja !== 'undefined') ? res.show_ja : true;
    document.querySelector("#ko").checked = (typeof res.show_ko !== 'undefined') ? res.show_ko : true;
    document.querySelector("#pt").checked = (typeof res.show_pt !== 'undefined') ? res.show_pt : true;
    document.querySelector("#ru").checked = (typeof res.show_ru !== 'undefined') ? res.show_ru : true;
    document.querySelector("#es").checked = (typeof res.show_es !== 'undefined') ? res.show_es : true;
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#save").addEventListener("click", saveOptions);
