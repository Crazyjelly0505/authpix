// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AuthPix is ERC721URIStorage {
    constructor() ERC721("AuthPix Protocol Token", "APIX") {}

    uint256 public nextTokenId;

    mapping(address => bool) public isModel;
    mapping(uint256 => address) public merchantOf;
    mapping(uint256 => address) public modelOf;
    mapping(uint256 => bool) public modelAgree;
    mapping(uint256 => bool) public merchantAgree;

    event ModelRegistered(address indexed model);
    event Mint(
        address indexed model,
        address indexed merchant,
        uint256 indexed tokenId,
        string tokenURI
    );
    event Burn(address indexed model, address indexed merchant, uint256 indexed tokenId);

    function registerModel() public {
        isModel[msg.sender] = true;
        emit ModelRegistered(msg.sender);
    }

    function mint(string memory _tokenURI, address _merchant) public {
        require(isModel[msg.sender], "Only models");
        require(_merchant != address(0), "Invalid merchant");

        nextTokenId++;

        _safeMint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, _tokenURI);

        modelOf[nextTokenId] = msg.sender;
        merchantOf[nextTokenId] = _merchant;

        emit Mint(msg.sender, _merchant, nextTokenId, _tokenURI);
    }

    function agreeBurn(uint256 _tokenId) public {
        require(merchantOf[_tokenId] == msg.sender || modelOf[_tokenId] == msg.sender, "You are not the owner");
        if(merchantOf[_tokenId] == msg.sender) {
          if (!merchantAgree[_tokenId]) {
          merchantAgree[_tokenId] = true;
          }
        }else {
          if (!modelAgree[_tokenId]) {
          modelAgree[_tokenId] = true;
          }
        }
    }

    function burn(uint256 _tokenId) public {
        require(merchantOf[_tokenId] == msg.sender || modelOf[_tokenId] == msg.sender, "Not authorized");
        require(modelAgree[_tokenId] == true, "Model disagree");
        require(merchantAgree[_tokenId] == true, "merchant disagree");
        _burn(_tokenId);

        emit Burn(modelOf[_tokenId], merchantOf[_tokenId], _tokenId);

        delete modelOf[_tokenId];
        delete merchantOf[_tokenId];
        delete modelAgree[_tokenId];
        delete merchantAgree[_tokenId];
    }

    function getPhotoInfo(uint256 _tokenId) public view returns (address _model, address _merchant, string memory _tokenURI) {
        return (
            modelOf[_tokenId],
            merchantOf[_tokenId],
            tokenURI(_tokenId)
        );
    }
}