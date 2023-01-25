const btnRefresh = $(".btn-refresh");
const btnSave = $(".btn-save");
const primaryPic = $(".picture.primary");
const imageList = $(".image-list");
const emailField = $('#email');
let generatedPicId = -1;
let objectIndex = null;
var savedImages = [];

  
// add a new row
function addNewRow(index){
    const newRow = $(`<tr id="row-${index}">
                        <td class="email-col">${savedImages[index].email}</td>
                        <td class="images-col"></td>
                    </tr>`);
    imageList.append(newRow);
}

// add image to a specific row
function addImage(index,imageId){
     const imageCol = $(`#row-${index} > .images-col`);     
     const newImage = $(`<img src="https://picsum.photos/id/${imageId}/60/60" class="picture thumb" alt="alt text" />`)
     imageCol.append(newImage);
}

function getEmailIndex() {
    const checkEmail = obj => obj.email === emailField.val(); //see if email exists in the array of objects
    return savedImages.findIndex(checkEmail); // find index
}

// returns true if input is valid 
function validate(field, label, type){
    const inputField = $(`#${field}`);    
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; //email regex
    let passed = true;    
    let fieldValue = (type == "picture") ? inputField.attr('src') : inputField.val(); //input field or img src 
    
    if(fieldValue==""){
        inputField.addClass('input-field-error');
        inputField.siblings('.input-error').text(`${label} is required`);
        return false;
    }
    else{
        // check fields
        if(type == 'email'){
            passed = emailPattern.test(inputField.val().trim()); 
        }      
        else if(type == 'picture'){
            objectIndex = getEmailIndex();
            if(objectIndex > -1){ // if email is already saved, see if image already linked to the email
                const checkImage = element => element === generatedPicId; 
                passed = !savedImages[objectIndex].images.some(checkImage); // passed if not in array
            }
        }

        // show errors
        if(!passed){
            inputField.addClass('input-field-error');
            if(type == "picture"){
                btnRefresh.addClass('btn-error');
                inputField.siblings('.input-error').text(`The picture is already linked to the email addresss`);
            }else{
                inputField.siblings('.input-error').text(`Please enter a valid ${label}`);
            }                
            return false;        
        }
        else{
            // remove error styling
            inputField.removeClass('input-field-error');
            btnRefresh.removeClass('btn-error');
            inputField.siblings('.input-error').text('');
            return true;
        }        
    }  
    
}

// Get a random picture
function generatePicture(){
    const max = 1084; //total number of images in picsum 
    const min = 0;
    const xhr = new XMLHttpRequest();
    var picExist = false;

    // loop until we get a picture that exist
    do{
        rand = Math.floor(Math.random() * (max - min + 1)) + min; //generate random number
        url = `https://picsum.photos/id/${rand}/600/350`; //interpolate number to the url 
 
        xhr.open('GET',url, false); //test the URL, *set asynchronous to false to complete the request first before sending a new one on the next iteration
        xhr.onload = () =>{
            if(xhr.status === 200){
                picExist = true;                
            } else {
                picExist = false;
            }
        }
        xhr.send();
    }while(!picExist)

    return rand;
}

function refreshImage(){
    generatedPicId = generatePicture();
    primaryPic.attr('src', `https://picsum.photos/id/${generatedPicId}/600/350` ); //set primary pic src attribute
}

$(document).ready( () => {
    refreshImage()
});

// refresh image
btnRefresh.on('click', () => {
    refreshImage()
});

// save image and refresh list
btnSave.on('click', () =>{
    let errorCount = 0;
    $('.form-message').removeClass('d-none');
    
    if(!validate('email','Email', "email")) {errorCount++;}
    if(!validate('picture','Picture', "picture")) {errorCount++;}
    
    if(errorCount > 0){
        // show error message
        $('.form-message').removeClass('alert-success');
        $('.form-message').addClass('alert-danger');
        $('.form-message').text(`Sorry there were ${errorCount} error(s) in the form.`);
    }
    else{
        // update datalist dropdown in the email field 
        if(getEmailIndex() < 0) {
            $('#prevEmails').append(`<option>${emailField.val()}</option>`);
        }

        // save to existing object in the array, else add a new object
        if(objectIndex > -1){           
            savedImages[objectIndex].images.push(generatedPicId);
        }else{
            objectIndex = savedImages.push(
                {
                    email: emailField.val().trim(),
                    images: [generatedPicId]
                },
            ) - 1;

            // display a new row
            addNewRow(objectIndex);
        }

        // reset list        
        $('#saved-none').addClass('d-none');
        $('#saved-list').removeClass('d-none');
        $('.placeholder').remove();
        addImage(objectIndex, generatedPicId);        

        // reset form        
        emailField.val('');
        refreshImage();
        
        // show success message
        $('.form-message').removeClass('alert-danger');
        $('.form-message').addClass('alert-success');
        $('.form-message').text(`Thanks! the image has been saved.`);
    } 
});