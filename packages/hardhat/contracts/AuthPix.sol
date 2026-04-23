// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AuthPix is ERC721URIStorage {
    constructor() ERC721("AuthPix Protocol Token", "APIX") {}

    uint256 public nextTokenId;

    struct productInfo{
        address merchant;
        address model;
        uint256 tokenid;
        uint256 requestAt;
        uint256 approveAt;
        uint256 mintAt;
        string tokenURI;
        string detail;
        bool report;
        bool burned;
    }

    struct Request{
        address merchant;
        address model;
        string tokenURI;
        string detail;
        uint256 createAt;
        uint256 agrOrRejAt;
        bool isApproved;
        bool isReject;
        bool isMinted;
    }
    Request[] public allRequests;

    mapping(address => bool) public isModel;
    mapping(address => uint256[]) public tokensByMerchant;
    mapping(address => uint256[]) public tokensByModel;
    mapping(address => uint256[]) public modelToRequest;
    mapping(address => uint256[]) public merchantToRequestIds;
    mapping(uint256 => productInfo) public allTokens;
    mapping(uint256 => mapping(address => bool)) public hasReported;

    event ModelRegistered(address indexed model);
    event Mint(
        address indexed model,
        address indexed merchant,
        uint256 indexed tokenId,
        string tokenURI
    );
    event Burn(address indexed model, address indexed merchant, uint256 indexed tokenId);
    event Report(address indexed user, uint256 indexed tokenId);
    event CreateRequest(address indexed merchant, address indexed model, string tokenURI);
    event ApproveRequest(uint256 indexed id, address indexed merchant, address indexed model, bool approved);

    //检查 token 是否存在
    function _existsToken(uint256 _tokenId) internal view returns (bool) {
        return _ownerOf(_tokenId) != address(0);
    }

    //注册成为模特
    function registerModel() public {
        isModel[msg.sender] = true;
        emit ModelRegistered(msg.sender);
    }

    //商家发布授权请求，关联商品各项信息
    function createRequest(address _model, string calldata _detail,string calldata _tokenURI) public {
        require(isModel[_model], "Invalid model");
        uint256 newId = allRequests.length;        
        Request storage newReq = allRequests.push();
    
        // 强制设定的系统字段
        newReq.merchant = msg.sender;
        newReq.createAt = block.timestamp;
        newReq.agrOrRejAt = 0;
        newReq.isApproved = false;
        newReq.isReject = false;
        newReq.isMinted = false;
    
        // 用户传入的业务字段
        newReq.model = _model;
        newReq.detail = _detail;
        newReq.tokenURI = _tokenURI;

        modelToRequest[_model].push(newId);
        merchantToRequestIds[msg.sender].push(newId);

        emit CreateRequest(msg.sender, _model, _tokenURI);
    }

    //模特筛选同意请求
    function approveRequest(uint256 _id, bool agree) public {
        require(isModel[msg.sender] == true, "Only Model");
        require(allRequests[_id].model == msg.sender, "Not your request");
        require(!allRequests[_id].isApproved && !allRequests[_id].isReject, "Already decided");

        if(agree){
            allRequests[_id].isApproved = true;
        }else{
            allRequests[_id].isReject = true;
        }
        allRequests[_id].agrOrRejAt = block.timestamp;

        emit ApproveRequest(_id, allRequests[_id].merchant, msg.sender, agree);
    }

    //商家发布商品，登记商品URI以及相关细节，需要模特同意
    function mint(uint256 _id) public {
        require(allRequests[_id].isApproved == true, "Need approve");
        require(allRequests[_id].merchant == msg.sender, "Not your request");
        require(!allRequests[_id].isMinted, "Already minted");
        
        address model = allRequests[_id].model;

        nextTokenId++;
        allRequests[_id].isMinted = true;
        productInfo storage information = allTokens[nextTokenId];
        
        _safeMint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, allRequests[_id].tokenURI);

        information.model = model;
        information.merchant = msg.sender;
        information.tokenid = nextTokenId;
        information.tokenURI = allRequests[_id].tokenURI;
        information.detail = allRequests[_id].detail;
        information.report = false;
        information.burned = false;
        information.requestAt = allRequests[_id].createAt;
        information.approveAt = allRequests[_id].agrOrRejAt;
        information.mintAt = block.timestamp;

        tokensByModel[model].push(nextTokenId);
        tokensByMerchant[msg.sender].push(nextTokenId);

        emit Mint(model, msg.sender, nextTokenId, allRequests[_id].tokenURI);
    }

    //商家可以撤回已发布的商品(链上发布历史不可修改)
    function burn(uint256 _tokenId) public {
        productInfo storage information = allTokens[_tokenId];

        require(_existsToken(_tokenId), "Token not exist");
        require(information.merchant == msg.sender, "Not authorized");

        information.burned = true;
        _burn(_tokenId);

        emit Burn(information.model, msg.sender, _tokenId);
    }

    //举报功能，传入要举报的id
    function report(uint256 _tokenId) public {
        require(_existsToken(_tokenId), "Token not exist");
        require(!hasReported[_tokenId][msg.sender], "Already reported");

        hasReported[_tokenId][msg.sender] = true;
        allTokens[_tokenId].report = true;

        emit Report(msg.sender, _tokenId);
    }

    //查询某个商品的信息
    function getPhotoInfo(uint256 _tokenId) public view returns (productInfo memory) {
        productInfo memory photoInfo = allTokens[_tokenId];
        return photoInfo;
    }

    //返回模特已发布过的商品数
    function getModelCount(address _model) public view returns(uint256) {
        return tokensByModel[_model].length;
    }

    //返回商家已发布过的商品数
    function getMerchantCount(address _merchant) public view returns(uint256) {
        return tokensByMerchant[_merchant].length;
    }

    //返回模特收到的所有请求，用于给模特展示
    function getRequestsForModel() public view returns(Request[] memory) {
        uint256[] storage requestIds = modelToRequest[msg.sender];
        uint256 len = modelToRequest[msg.sender].length;
        Request[] memory myRequest = new Request[](len);
        
        for(uint256 i=0; i<len; i++){
            uint256 id = requestIds[i];
            myRequest[i] = allRequests[id]; 
        }

        return myRequest;
    }

    //返回商家发送的所有请求，用于给商家展示
    function getRequestsForMerchant() public view returns(Request[] memory){
        uint256[] storage requestIds = merchantToRequestIds[msg.sender];
        uint256 len = requestIds.length;
        Request[] memory myRequest = new Request[](len);

        for(uint256 i=0; i<len; i++){
            uint256 id = requestIds[i];
            myRequest[i] = allRequests[id];
        }

        return myRequest;
    }
}  
