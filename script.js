document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-theme');
        themeToggle.checked = true;
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
        updateReceipt();
    });
    
    // Handle donation category selection
    const categoryOptions = document.querySelectorAll('.category-option');
    categoryOptions.forEach(option => {
        option.addEventListener('click', function() {
            categoryOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Show/hide relevant form sections
            const category = this.dataset.category;
            document.querySelectorAll('[id$="-donation"]').forEach(section => {
                section.style.display = 'none';
            });
            
            if (category === 'money') {
                document.querySelectorAll('#money-donation').forEach(section => {
                    section.style.display = 'block';
                });
            } else {
                document.getElementById(`${category}-donation`).style.display = 'block';
                if (document.getElementById(`${category}-donation`).nextElementSibling) {
                    document.getElementById(`${category}-donation`).nextElementSibling.style.display = 'block';
                }
            }
            
            updateReceipt();
        });
    });
    
    // Handle donation frequency selection
    const frequencyOptions = document.querySelectorAll('.frequency-option');
    frequencyOptions.forEach(option => {
        option.addEventListener('click', function() {
            frequencyOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            updateReceipt();
        });
    });
    
    // Handle amount selection
    const amountOptions = document.querySelectorAll('.amount-option:not(.custom-amount)');
    amountOptions.forEach(option => {
        option.addEventListener('click', function() {
            amountOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('customAmount').value = '';
            updateReceipt();
        });
    });
    
    // Handle custom amount input
    const customAmountInput = document.getElementById('customAmount');
    customAmountInput.addEventListener('input', function() {
        if (this.value) {
            amountOptions.forEach(opt => opt.classList.remove('selected'));
            updateReceipt();
        }
    });
    
    // Add event listeners to form elements that should update the receipt
    document.getElementById('cause').addEventListener('change', updateReceipt);
    document.getElementById('currency').addEventListener('change', updateReceipt);
    document.getElementById('name').addEventListener('input', updateReceipt);
    document.getElementById('food-type').addEventListener('change', updateReceipt);
    document.getElementById('food-quantity').addEventListener('input', updateReceipt);
    document.getElementById('clothes-type').addEventListener('change', updateReceipt);
    document.getElementById('clothes-quantity').addEventListener('input', updateReceipt);
    document.getElementById('books-type').addEventListener('change', updateReceipt);
    document.getElementById('books-quantity').addEventListener('input', updateReceipt);
    
    // Handle form submission
    const donationForm = document.getElementById('donationForm');
    donationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const category = document.querySelector('.category-option.selected').dataset.category;
        const frequency = document.querySelector('.frequency-option.selected').dataset.frequency;
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        
        let amount, description;
        
        if (category === 'money') {
            amount = getSelectedAmount();
            const cause = document.getElementById('cause');
            const causeText = cause.options[cause.selectedIndex].text;
            description = `${causeText} - ${frequency === 'one-time' ? 'One-time' : 'Monthly'}`;
            
            // Validate monetary donation
            if (!amount || amount <= 0) {
                alert('Please enter a valid donation amount');
                return;
            }
        } else if (category === 'food') {
            const foodType = document.getElementById('food-type');
            const foodText = foodType.options[foodType.selectedIndex].text;
            const quantity = document.getElementById('food-quantity').value;
            description = `Food Donation: ${quantity}kg of ${foodText}`;
            amount = 0; // Physical donations don't have monetary value
            
            // Validate food donation
            if (!quantity || quantity <= 0) {
                alert('Please enter a valid quantity for your food donation');
                return;
            }
        } else if (category === 'clothes') {
            const clothesType = document.getElementById('clothes-type');
            const clothesText = clothesType.options[clothesType.selectedIndex].text;
            const quantity = document.getElementById('clothes-quantity').value;
            description = `Clothes Donation: ${quantity} ${clothesText} items`;
            amount = 0;
            
            // Validate clothes donation
            if (!quantity || quantity <= 0) {
                alert('Please enter a valid quantity for your clothes donation');
                return;
            }
        } else if (category === 'books') {
            const booksType = document.getElementById('books-type');
            const booksText = booksType.options[booksType.selectedIndex].text;
            const quantity = document.getElementById('books-quantity').value;
            description = `Books Donation: ${quantity} ${booksText} books`;
            amount = 0;
            
            // Validate books donation
            if (!quantity || quantity <= 0) {
                alert('Please enter a valid quantity for your books donation');
                return;
            }
        }
        
        // Basic validation for required fields
        if (!email || !name) {
            alert('Please fill in all required fields');
            return;
        }
        
        // For physical donations, validate address
        if (category !== 'money' && (!address || address.trim() === '')) {
            alert('Please provide a pickup address for your donation');
            return;
        }
        
        // Generate a random receipt ID
        const receiptId = 'SPN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
        
        // In a real application, you would process the payment here
        // For this demo, we'll just show a success message
        if (category === 'money') {
            alert(`Thank you for your donation of ${formatCurrency(amount)}! A receipt has been sent to ${email}`);
        } else {
            alert(`Thank you for your ${category} donation! We will contact you at ${phone || email} to arrange pickup.`);
        }
        
        // Generate and show final receipt
        generateFinalReceipt(receiptId, description, amount, name);
        
        // Reset form
        donationForm.reset();
        amountOptions[2].classList.add('selected'); // Reset to default amount
        updateReceipt();
    });
    
    // Update receipt based on form inputs
    function updateReceipt() {
        const category = document.querySelector('.category-option.selected').dataset.category;
        const frequency = document.querySelector('.frequency-option.selected').dataset.frequency;
        
        if (category === 'money') {
            const amount = getSelectedAmount();
            const cause = document.getElementById('cause');
            const causeText = cause.options[cause.selectedIndex].text;
            
            // Update receipt items
            document.querySelector('.item-name').textContent = `${causeText} - ${frequency === 'one-time' ? 'One-time' : 'Monthly'}`;
            document.querySelector('.item-amount').textContent = formatCurrency(amount);
            document.querySelector('.total-amount').textContent = formatCurrency(amount);
        } else {
            let description, quantity;
            
            if (category === 'food') {
                const foodType = document.getElementById('food-type');
                const foodText = foodType.options[foodType.selectedIndex].text;
                quantity = document.getElementById('food-quantity').value || '0';
                description = `Food: ${quantity}kg ${foodText}`;
            } else if (category === 'clothes') {
                const clothesType = document.getElementById('clothes-type');
                const clothesText = clothesType.options[clothesType.selectedIndex].text;
                quantity = document.getElementById('clothes-quantity').value || '0';
                description = `Clothes: ${quantity} ${clothesText} items`;
            } else if (category === 'books') {
                const booksType = document.getElementById('books-type');
                const booksText = booksType.options[booksType.selectedIndex].text;
                quantity = document.getElementById('books-quantity').value || '0';
                description = `Books: ${quantity} ${booksText} books`;
            }
            
            document.querySelector('.item-name').textContent = description;
            document.querySelector('.item-amount').textContent = 'N/A';
            document.querySelector('.total-amount').textContent = 'N/A';
        }
        
        // Update date to current date
        const now = new Date();
        document.querySelector('.date-value').textContent = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Update donor name if entered
        const name = document.getElementById('name').value;
        if (name) {
            document.querySelector('.donor-value').textContent = name;
        } else {
            document.querySelector('.donor-value').textContent = 'Your Name';
        }
    }
    
    // Generate final receipt after donation
    function generateFinalReceipt(receiptId, description, amount, donorName) {
        const receiptElement = document.createElement('div');
        receiptElement.className = 'final-receipt';
        receiptElement.innerHTML = `
            <div class="receipt-header">
                <div class="logo">
                    <i class="fas fa-hand-holding-heart"></i>
                    <span>Spenden</span>
                </div>
                <div class="receipt-id">${receiptId}</div>
            </div>
            
            <div class="receipt-body">
                <div class="receipt-item">
                    <div class="item-name">${description}</div>
                    <div class="item-amount">${amount > 0 ? formatCurrency(amount) : 'N/A'}</div>
                </div>
                
                <div class="receipt-total">
                    <div class="total-label">Total</div>
                    <div class="total-amount">${amount > 0 ? formatCurrency(amount) : 'N/A'}</div>
                </div>
                
                <div class="receipt-date">
                    <div class="date-label">Date</div>
                    <div class="date-value">${new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                </div>
                
                <div class="receipt-donor">
                    <div class="donor-label">Donor</div>
                    <div class="donor-value">${donorName}</div>
                </div>
            </div>
            
            <div class="receipt-footer">
                <p>Thank you for your generous donation!</p>
                <p>This receipt is valid for tax purposes.</p>
                <button class="btn btn-print" onclick="window.print()">Print Receipt</button>
            </div>
        `;
        
        // Show receipt in a modal or new section
        const existingReceipt = document.querySelector('.final-receipt');
        if (existingReceipt) {
            existingReceipt.remove();
        }
        
        document.querySelector('.donation-content').after(receiptElement);
        
        // Scroll to receipt
        receiptElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Get the selected amount
    function getSelectedAmount() {
        const selectedAmount = document.querySelector('.amount-option.selected');
        if (selectedAmount && !selectedAmount.classList.contains('custom-amount')) {
            return parseInt(selectedAmount.dataset.amount);
        }
        
        const customAmount = document.getElementById('customAmount').value;
        return customAmount ? parseInt(customAmount) : 0;
    }
    
    // Format currency based on selection
    function formatCurrency(amount) {
        const currency = document.getElementById('currency').value;
        
        switch(currency) {
            case 'inr':
                return `₹${amount.toLocaleString('en-IN')}`;
            case 'usd':
                return `$${amount.toLocaleString()}`;
            case 'eur':
                return `€${amount.toLocaleString()}`;
            case 'gbp':
                return `£${amount.toLocaleString()}`;
            default:
                return `₹${amount.toLocaleString('en-IN')}`;
        }
    }
    
    // Initialize receipt with default values
    updateReceipt();
});