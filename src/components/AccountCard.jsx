import { HiWifi } from 'react-icons/hi2';

const AccountCard = ({ account, onClick }) => {
    // Generate a consistent "random" gradient or style based on type
    const getCardStyle = (type) => {
        const styles = {
            salary: 'card-bg-salary',
            expense: 'card-bg-expense',
            savings: 'card-bg-savings',
            investment: 'card-bg-investment'
        };
        return styles[type] || styles.salary;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div
            className={`credit-card ${getCardStyle(account.accountType)}`}
            onClick={onClick}
        >
            {/* Texture & Shine Effects */}
            <div className="card-texture"></div>
            <div className="card-shine"></div>

            <div className="card-content">
                {/* Top Section: Chip & Contactless */}
                <div className="card-top">
                    <div className="card-chip"></div>
                    <HiWifi size={28} className="card-contactless" />
                </div>

                {/* Middle Section: Card Number */}
                <div className="card-number">
                    **** **** **** {account._id.slice(-4).toUpperCase()}
                </div>

                {/* Bottom Section: Details */}
                <div className="card-bottom">
                    <div>
                        <p className="card-label">Account Name</p>
                        <p className="card-value" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {account.accountName}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p className="card-label">Current Balance</p>
                        <p className="card-value" style={{ fontSize: '1.25rem' }}>
                            {formatCurrency(account.balance)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountCard;
