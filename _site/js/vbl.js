var vblprotocol = "http";
var vblbase = "vblcb.wisseq.eu/VBLCB_WebService/data"

var vbl = new function(){
    var self = this;
    this.getRequest = function(uri, callback){
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function () { callback(JSON.parse(xhttp.responseText)); };
        xhttp.onerror = function xhrError () { console.error(this.statusText); }
        xhttp.open("GET", uri, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();    
    }
    this.getUrl = function(path, query){
        return vblprotocol + "://" + vblbase + "/" + path + "?" + query;
    }


    this.orgDetail = function(orgId, callback){
        self.getRequest(self.getUrl("OrgDetailByGuid", "issguid=" + orgId), function(org){
            callback(org);
            $.topic("vbl.organisation.loaded").publish();
        });
    }

    this.members = function(orgId, callback){
        self.getRequest(self.getUrl("RelatiesByOrgGuid", "orgguid=" + orgId), function(members){
            callback(members);
            $.topic("vbl.members.loaded").publish();
        });
    }

    this.matches = function(orgId, callback){
        self.getRequest(self.getUrl("OrgMatchesByGuid", "issguid=" +  orgId), function(matches){
            callback(matches);
            $.topic("vbl.matches.loaded").publish();
        });
    }
}