// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VeCollabNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Fee settings
    uint256 public platformFeePercentage = 250; // 2.5% (in basis points)
    address public feeRecipient;
    
    // Mapping from token ID to price
    mapping(uint256 => uint256) private _tokenPrices;
    
    // Mapping from token ID to creator
    mapping(uint256 => address) private _tokenCreators;
    
    // Mapping from token ID to whether it is for sale
    mapping(uint256 => bool) private _tokenForSale;
    
    // Mapping from token ID to auction end time (0 if not in auction)
    mapping(uint256 => uint256) private _auctionEndTime;
    
    // Mapping from token ID to highest bidder
    mapping(uint256 => address) private _highestBidder;
    
    // Mapping from token ID to highest bid
    mapping(uint256 => uint256) private _highestBid;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI);
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTPurchased(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event AuctionStarted(uint256 indexed tokenId, address indexed seller, uint256 startPrice, uint256 endTime);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 amount);
    
    constructor(address initialOwner) ERC721("VeCollab NFT", "VCNFT") Ownable(initialOwner) {
        feeRecipient = initialOwner;
    }
    
    /**
     * @dev Required override to handle both ERC721URIStorage and ERC721Enumerable
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Required override to handle both ERC721URIStorage and ERC721Enumerable
     */
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    /**
     * @dev Required override to handle both ERC721URIStorage and ERC721Enumerable
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Required override to handle both ERC721URIStorage and ERC721Enumerable
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Mint a new NFT
     * @param recipient The address that will receive the NFT
     * @param tokenURI The token URI
     * @return The token ID of the newly minted NFT
     */
    function mintNFT(address recipient, string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _tokenCreators[newTokenId] = msg.sender;
        
        emit NFTMinted(newTokenId, msg.sender, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev List an NFT for sale
     * @param tokenId The token ID of the NFT
     * @param price The price in wei
     */
    function listForSale(uint256 tokenId, uint256 price) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Caller is not owner nor approved");
        require(price > 0, "Price must be greater than zero");
        
        _tokenPrices[tokenId] = price;
        _tokenForSale[tokenId] = true;
        _auctionEndTime[tokenId] = 0; // Not an auction
        
        emit NFTListed(tokenId, msg.sender, price);
    }
    
    /**
     * @dev Remove an NFT from sale
     * @param tokenId The token ID of the NFT
     */
    function removeFromSale(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Caller is not owner nor approved");
        require(_tokenForSale[tokenId], "Token is not for sale");
        
        _tokenForSale[tokenId] = false;
        
        // If it's an auction with bids, refund the highest bidder
        if (_auctionEndTime[tokenId] > 0 && _highestBid[tokenId] > 0) {
            address bidder = _highestBidder[tokenId];
            uint256 amount = _highestBid[tokenId];
            
            _highestBidder[tokenId] = address(0);
            _highestBid[tokenId] = 0;
            _auctionEndTime[tokenId] = 0;
            
            // Refund the highest bidder
            (bool success, ) = bidder.call{value: amount}("");
            require(success, "Refund failed");
        }
    }
    
    /**
     * @dev Buy an NFT
     * @param tokenId The token ID of the NFT
     */
    function buyNFT(uint256 tokenId) public payable {
        address owner = ownerOf(tokenId);
        require(owner != msg.sender, "Cannot buy your own NFT");
        require(_tokenForSale[tokenId], "Token is not for sale");
        require(_auctionEndTime[tokenId] == 0, "Token is in auction");
        require(msg.value >= _tokenPrices[tokenId], "Insufficient funds");
        
        uint256 price = _tokenPrices[tokenId];
        address creator = _tokenCreators[tokenId];
        
        // Mark as not for sale
        _tokenForSale[tokenId] = false;
        
        // Calculate fees
        uint256 platformFee = (price * platformFeePercentage) / 10000;
        uint256 creatorRoyalty = 0;
        
        // If creator is not the seller, add royalty (2.5%)
        if (creator != owner) {
            creatorRoyalty = (price * 250) / 10000; // 2.5%
        }
        
        uint256 sellerProceeds = price - platformFee - creatorRoyalty;
        
        // Transfer the NFT
        _transfer(owner, msg.sender, tokenId);
        
        // Pay platform fee
        (bool feeSuccess, ) = feeRecipient.call{value: platformFee}("");
        require(feeSuccess, "Platform fee transfer failed");
        
        // Pay creator royalty if applicable
        if (creatorRoyalty > 0) {
            (bool royaltySuccess, ) = creator.call{value: creatorRoyalty}("");
            require(royaltySuccess, "Creator royalty transfer failed");
        }
        
        // Pay seller
        (bool sellerSuccess, ) = owner.call{value: sellerProceeds}("");
        require(sellerSuccess, "Seller payment failed");
        
        // Refund excess payment
        if (msg.value > price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit NFTPurchased(tokenId, owner, msg.sender, price);
    }
    
    /**
     * @dev Start an auction for an NFT
     * @param tokenId The token ID of the NFT
     * @param startPrice The starting price
     * @param duration The duration of the auction in seconds
     */
    function startAuction(uint256 tokenId, uint256 startPrice, uint256 duration) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Caller is not owner nor approved");
        require(startPrice > 0, "Starting price must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");
        
        _tokenPrices[tokenId] = startPrice;
        _tokenForSale[tokenId] = true;
        _auctionEndTime[tokenId] = block.timestamp + duration;
        _highestBidder[tokenId] = address(0);
        _highestBid[tokenId] = 0;
        
        emit AuctionStarted(tokenId, msg.sender, startPrice, _auctionEndTime[tokenId]);
    }
    
    /**
     * @dev Place a bid on an NFT auction
     * @param tokenId The token ID of the NFT
     */
    function placeBid(uint256 tokenId) public payable {
        require(_tokenForSale[tokenId], "Token is not for sale");
        require(_auctionEndTime[tokenId] > 0, "Token is not in auction");
        require(block.timestamp < _auctionEndTime[tokenId], "Auction has ended");
        require(ownerOf(tokenId) != msg.sender, "Cannot bid on your own NFT");
        
        uint256 minBid = _highestBid[tokenId] > 0 ? _highestBid[tokenId] * 11 / 10 : _tokenPrices[tokenId];
        require(msg.value >= minBid, "Bid too low");
        
        // Refund the previous highest bidder
        if (_highestBid[tokenId] > 0) {
            address previousBidder = _highestBidder[tokenId];
            uint256 previousBid = _highestBid[tokenId];
            
            (bool success, ) = previousBidder.call{value: previousBid}("");
            require(success, "Refund to previous bidder failed");
        }
        
        // Set new highest bid
        _highestBidder[tokenId] = msg.sender;
        _highestBid[tokenId] = msg.value;
        
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }
    
    /**
     * @dev End an auction and transfer the NFT to the highest bidder
     * @param tokenId The token ID of the NFT
     */
    function endAuction(uint256 tokenId) public {
        require(_tokenForSale[tokenId], "Token is not for sale");
        require(_auctionEndTime[tokenId] > 0, "Token is not in auction");
        require(block.timestamp >= _auctionEndTime[tokenId], "Auction has not ended yet");
        
        address owner = ownerOf(tokenId);
        address winner = _highestBidder[tokenId];
        uint256 highestBid = _highestBid[tokenId];
        address creator = _tokenCreators[tokenId];
        
        // Reset auction data
        _tokenForSale[tokenId] = false;
        _auctionEndTime[tokenId] = 0;
        _highestBidder[tokenId] = address(0);
        _highestBid[tokenId] = 0;
        
        // If there's no bidder, just end the auction
        if (winner == address(0)) {
            emit AuctionEnded(tokenId, address(0), 0);
            return;
        }
        
        // Calculate fees
        uint256 platformFee = (highestBid * platformFeePercentage) / 10000;
        uint256 creatorRoyalty = 0;
        
        // If creator is not the seller, add royalty (2.5%)
        if (creator != owner) {
            creatorRoyalty = (highestBid * 250) / 10000; // 2.5%
        }
        
        uint256 sellerProceeds = highestBid - platformFee - creatorRoyalty;
        
        // Transfer the NFT
        _transfer(owner, winner, tokenId);
        
        // Pay platform fee
        (bool feeSuccess, ) = feeRecipient.call{value: platformFee}("");
        require(feeSuccess, "Platform fee transfer failed");
        
        // Pay creator royalty if applicable
        if (creatorRoyalty > 0) {
            (bool royaltySuccess, ) = creator.call{value: creatorRoyalty}("");
            require(royaltySuccess, "Creator royalty transfer failed");
        }
        
        // Pay seller
        (bool sellerSuccess, ) = owner.call{value: sellerProceeds}("");
        require(sellerSuccess, "Seller payment failed");
        
        emit AuctionEnded(tokenId, winner, highestBid);
    }
    
    /**
     * @dev Get the details of an NFT
     * @param tokenId The token ID of the NFT
     * @return isForSale Whether the NFT is for sale
     * @return price The price/starting price of the NFT
     * @return isAuction Whether the NFT is in an auction
     * @return auctionEndTime The end time of the auction (0 if not in auction)
     * @return highestBidder The highest bidder (address(0) if none)
     * @return highestBid The highest bid (0 if none)
     * @return creator The creator of the NFT
     */
    function getNFTDetails(uint256 tokenId) public view returns (
        bool isForSale,
        uint256 price,
        bool isAuction,
        uint256 auctionEndTime,
        address highestBidder,
        uint256 highestBid,
        address creator
    ) {
        require(_exists(tokenId), "NFT does not exist");
        
        isForSale = _tokenForSale[tokenId];
        price = _tokenPrices[tokenId];
        isAuction = _auctionEndTime[tokenId] > 0;
        auctionEndTime = _auctionEndTime[tokenId];
        highestBidder = _highestBidder[tokenId];
        highestBid = _highestBid[tokenId];
        creator = _tokenCreators[tokenId];
    }
    
    /**
     * @dev Set the platform fee percentage
     * @param newFeePercentage The new fee percentage in basis points (e.g., 250 for 2.5%)
     */
    function setPlatformFeePercentage(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= 1000, "Fee percentage cannot exceed 10%");
        platformFeePercentage = newFeePercentage;
    }
    
    /**
     * @dev Set the fee recipient
     * @param newFeeRecipient The new fee recipient
     */
    function setFeeRecipient(address newFeeRecipient) public onlyOwner {
        require(newFeeRecipient != address(0), "Fee recipient cannot be zero address");
        feeRecipient = newFeeRecipient;
    }
    
    /**
     * @dev Returns the total supply of tokens
     */
    function totalSupply() public view override(ERC721Enumerable) returns (uint256) {
        return super.totalSupply();
    }
    
    /**
     * @dev Returns a token ID at a given index of all the tokens stored
     */
    function tokenByIndex(uint256 index) public view override(ERC721Enumerable) returns (uint256) {
        return super.tokenByIndex(index);
    }
    
    /**
     * @dev Returns a token ID owned by `owner` at a given index of its token list
     */
    function tokenOfOwnerByIndex(address owner, uint256 index) public view override(ERC721Enumerable) returns (uint256) {
        return super.tokenOfOwnerByIndex(owner, index);
    }
    
    /**
     * @dev See if a token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
