class Donate extends HTMLElement {

    constructor(){
        super();

        this.template = document.getElementById("donation-template");
        this.baseUri = "https://clubmgmt-donation-service-test.azurewebsites.net/api/donations";
        this.stripe = Stripe("pk_test_8U57DC7IOjILi4nOIQM3lmVg");
    }

    async connectedCallback() {
        this.innerHTML = this.template.innerHTML;

        let amountForm = this.querySelector('#amount-form');

        let donate5 = this.querySelector("#donate5");
        let donate10 = this.querySelector("#donate10");
        let donate20 = this.querySelector("#donate20");
        let donation = this.querySelector("#donateOther");
        let cardHolder = this.querySelector('#card-holder');
        
        let updateAndValidateDonation = function(amount){
            donation.value = amount;
            donation.dispatchEvent(new InputEvent('change'));
        };
        
        donate5.addEventListener('click', async (event) =>{
            updateAndValidateDonation(5);
        });
        donate10.addEventListener('click', async (event) =>{
            updateAndValidateDonation(10);
        });
        donate20.addEventListener('click', async (event) =>{
            updateAndValidateDonation(20);
        });

        let amountProvided;
        let cardHolderProvided;
        let showCardInformation = () => {
            if (amountProvided && cardHolderProvided){
                // Show CC form
                const elements = this.stripe.elements();
                this.card = elements.create("card");
                this.card.mount("#card-element");
            }
        };
        
        donation.addEventListener('change', async (event) =>{
            amountProvided = !!event.target.value;
            
            showCardInformation();
        });
        cardHolder.addEventListener('change', async (event) =>{
            cardHolderProvided = !!event.target.value;

            showCardInformation();
        });

        var donationCommand = {
            amount: donation.value
        };

        amountForm.addEventListener('submit', async (event) => {
            event.preventDefault();
           
            // Prepare donation
            const donationId = guid();
            const prepareDonation = {
                donationId: donationId,
                amount: donation.value,
                currency: "eur"
            };
            const url = `${this.baseUri}/${donationId}/PrepareDonation`;

            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prepareDonation),
            });

            var paymentIntent = await response.json();

            var result = await this.stripe.confirmCardPayment(paymentIntent.secret, {
                payment_method: {
                    card: this.card,
                    billing_details: {
                        name: cardHolder.value
                    }
                }
            });

            // Show donation confirmation
            // TODO: this needs to be a better UI (label)
            if (result.error){
                console.log("oops");
            }
            else
            {
                console.log("OK");
            }
            
            // TODO:
            // testing Stripe CC: 4000002500003155
        });

        const cancel = amountForm.querySelector('#cancel');
        cancel.addEventListener('click', async (event) => {
            event.preventDefault();

            donation.value = 0;
        });
    }
}

export { Donate }