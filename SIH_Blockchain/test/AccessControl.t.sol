// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AccessControl} from "../src/AccessControl.sol";

contract AccessControlTest is Test {
    AccessControl public accessControl;
    address public user = address(0x123);

    function setUp() public {
        accessControl = new AccessControl();
    }

    function testAssignRole() public {
        accessControl.assignRole(user, AccessControl.Role.Bank);
        assertEq(uint(accessControl.getRole(user)), uint(AccessControl.Role.Bank));
    }

    function testRemoveRole() public {
        accessControl.assignRole(user, AccessControl.Role.Bank);
        assertEq(uint(accessControl.getRole(user)), uint(AccessControl.Role.Bank));

        accessControl.removeRole(user);
        assertEq(uint(accessControl.getRole(user)), uint(AccessControl.Role.None));
    }

    function testRemoveRoleUnauthorized() public {
        accessControl.assignRole(user, AccessControl.Role.Bank);

        vm.prank(address(0x456)); // unauthorized caller
        vm.expectRevert("AccessControl: insufficient permissions");
        accessControl.removeRole(user);
    }
}
