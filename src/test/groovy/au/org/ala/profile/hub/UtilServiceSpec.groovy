package au.org.ala.profile.hub

import au.org.ala.ws.service.WebService
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

/*
 * Copyright (C) 2021 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 23/6/21.
 */

class UtilServiceSpec extends Specification implements ServiceUnitTest<UtilService> {
    def setup() {
    }

    def "addDayToDate should add and subtract days correctly" () {
        Date reference
        Date result

        when:
        reference = new Date("2020/02/03")
        result = service.addDayToDate(reference, 2)

        then:
        result.getDate() == 5
        result.getMonth() == 1
        result.getYear() == 120

        when:
        reference = new Date("2020/02/03")
        result = service.addDayToDate(reference, -2)

        then:
        result.getDate() == 1
        result.getMonth() == 1
        result.getYear() == 120
    }
}
