<div class="panel panel-default" ng-controller="UserAccessController as userCtrl" ng-form="UserForm" ng-cloak>
    <div class="panel-heading">
        <a name="accessControl">
            <h4 class="section-panel-heading">Access control</h4>
            <p:help help-id="opus.edit.accessControl"/>
        </a>
    </div>

    <div class="panel-body">

        <tabset>
            <tab heading="User access" select="userCtrl.accessControlTabChanged('user')">
                <div class="row">
                    <div class="col-sm-12">
                        <p>
                            This section provides control over the people who can access the user interface for your collection.
                        </p>

                        <h5 class="section-panel-heading padding-bottom-1 padding-top-1">Collection visibility</h5>

                        <div class="checkbox padding-bottom-1">
                            <label for="privateCollection" class="inline-label">
                                <input id="privateCollection" type="checkbox" name="privateCollection"
                                    ng-change="userCtrl.privateModeChanged(UserForm)"
                                       ng-model="userCtrl.opus.privateCollection" ng-false-value="false">
                                Make this collection private
                            </label>
                            <div class="small padding-left-1" ng-show="userCtrl.opus.privateCollection">
                                When the collection is 'private' only people who have been added to the collection with at least the 'User' role will be allowed to view the profiles within the collection.
                                <p class="bg-info alert alert-danger">
                                    <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                                    <span class="sr-only">Error:</span>When you change collection private to public, existing all users who have USER ROLE will be deleted.
                                </p>
                            </div>
                        </div>

                        <h5 class="section-panel-heading padding-bottom-1">Users</h5>

                        <p>Assign users Admin, Editor or Author roles to this profile collection.
                        <ul>
                            <li><b>Admin</b> - can edit the configuration for the entire collection, and can create, modify, delete and publish any profile in the collection.
                            </li>
                            <li><b>Author</b> - can create and edit content on any profile page within this collection. Can also archive profiles.</li>
                            <li><b>Editor</b> - can edit any profile within this collection, but not create profiles.</li>
                            <li><b>Reviewer</b> - can view and add review comments on any profile page within this collection, but cannot create or modify profiles.
                        <li ng-show="userCtrl.opus.privateCollection"><b>User</b> - can view any profile page within this <i>private</i> collection, but cannot create or modify profiles, and cannot comment on profiles.
                            </li>
                        </ul>

                        <div class="table-responsive">
                            <table class="table table-striped" ng-show="userCtrl.users.length > 0">
                                <tr>
                                    <th width="20%">Name</th>
                                    <th width="20%">Email</th>
                                    <th width="10%">Role</th>
                                    <th width="35%">Notes</th>
                                    <th width="15%"></th>
                                </tr>

                                <tr ng-repeat="user in userCtrl.users | orderBy:'name'" ng-if="userCtrl.opus.privateCollection || (!userCtrl.opus.privateCollection && user.role != 'ROLE_USER')">
                                    <td>
                                        {{ user.name }}
                                    </td>
                                    <td>
                                        {{ user.email }}
                                    </td>
                                    <td>
                                        {{ (userCtrl.roles | filter:user.role)[0].name }}
                                    </td>
                                    <td>
                                        {{ user.notes }}
                                    </td>
                                    <td>
                                        <button class="btn btn-link fa fa-trash-o color--red" title="Delete user"
                                                ng-click="userCtrl.deleteUser(user.userId, UserForm)"></button>
                                        <button class="btn btn-link fa fa-edit" title="Edit user"
                                                ng-click="userCtrl.editUser(user.userId, UserForm)"></button>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </tab>
            <tab heading="Service access" select="userCtrl.accessControlTabChanged('service')">
                <div class="row">
                    <div class="col-sm-12">
                        <p>
                            This section provides control over how other applications access your collection's data.
                        </p>

                        <h5 class="section-panel-heading padding-bottom-1 padding-top-1">Access token</h5>
                        <p>
                            An access token allows another application to call services to access data in your collection.
                            Without this token, your collection's data can only accessed via the user interface.
                        </p>
                        <p>
                            To use an access token, all service requests must include the token in a header field named
                            <b>ACCESS-TOKEN</b>.
                        </p>

                        <div ng-show="userCtrl.opus.accessToken">
                            <p>Your access token is:</p>
                            <div class="well">{{ userCtrl.opus.accessToken }}</div>
                            <p>Your collection identifier (opusId) is:</p>
                            <div class="well">{{ userCtrl.opus.uuid }}</div>
                        </div>

                        <div ng-show="!userCtrl.opus.accessToken">
                            <p>You have not created an access token for your collection.</p>
                        </div>
                    </div>
                </div>
            </tab>

        </tabset>

    </div>


    <div class="panel-footer">
        <div class="row">
            <div class="col-md-12" ng-show="userCtrl.accessControlTab == 'user'">
                <div class="btn-group">
                    <button class="btn btn-default" ng-click="userCtrl.addUser(UserForm)" ng-disabled="!userCtrl.opus.privateCollection && UserForm.$dirty">
                        <i class="fa fa-plus"></i>  Add user</button>
                    <button class="btn btn-default" ng-click="userCtrl.reset(UserForm)" ng-disabled="!userCtrl.opus.privateCollection && UserForm.$dirty">Reset</button>
                </div>
                <save-button ng-click="userCtrl.save(UserForm)" form="UserForm"></save-button>
            </div>

            <div class="col-md-12" ng-show="userCtrl.accessControlTab == 'service'">
                <div class="pull-right">
                    <button class="btn btn-danger" ng-show="userCtrl.opus.accessToken" ng-click="userCtrl.revokeAccessToken()"><span class="fa fa-trash-o">&nbsp;</span>Revoke access token</button>
                    <button class="btn btn-primary" ng-show="!userCtrl.opus.accessToken" ng-click="userCtrl.generateAccessToken()"><span class="fa fa-key">&nbsp;</span>Create access token</button>
                </div>
            </div>
        </div>
    </div>
</div>