function sendMail(contactForm) {
    emailjs.send("gmail", "milestone02", {
        "from_name": contactForm.username.value,
        "from_email": contactForm.emailaddress.value,
        "subject": contactForm.subject.value,
        "content": contactForm.content.value
    })
    .then(
    function(response) {
        console.log("Email sent", response);
    },
    function(error) {
        console.log("Epic fail", error);    
    })
}