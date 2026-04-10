package cit.edu.ang.medpoint.repository;

import cit.edu.ang.medpoint.entity.DoctorDutySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorDutyScheduleRepository extends JpaRepository<DoctorDutySchedule, Long> {
    List<DoctorDutySchedule> findAllByOrderByDoctorNameAscDutyDayAscDutyTimeAsc();
}
