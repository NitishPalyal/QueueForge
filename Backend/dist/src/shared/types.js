// EVENT STATUS //
export var EventStatus;
(function (EventStatus) {
    EventStatus[EventStatus["waiting"] = 0] = "waiting";
    EventStatus[EventStatus["active"] = 1] = "active";
    EventStatus[EventStatus["completed"] = 2] = "completed";
    EventStatus[EventStatus["failed"] = 3] = "failed";
})(EventStatus || (EventStatus = {}));
//# sourceMappingURL=types.js.map